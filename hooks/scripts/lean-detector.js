#!/usr/bin/env node

/**
 * lean-detector.js
 *
 * 공포(栱包) 하네스 — 안쏠림 복잡도 선제 감지
 *
 * 역할: PostToolUse 이벤트마다 복잡도 신호를 누적하여
 *       위험 임계값 도달 시 안전 모드로 선제 전환.
 *
 * 안쏠림 원칙: 기둥 상단을 미리 안쪽으로 기울여 외력을 선제 저항.
 *             복잡도가 확정되기 전에 안전 모드로 전환한다.
 *
 * 의존성: context-watch.js가 먼저 실행되어야 한다 (hooks.json 순서 보장).
 *
 * Claude Code Hook 이벤트: PostToolUse
 * stdin: { tool_name, tool_input, tool_response, session_id }
 * stdout: { continue: true }
 */

const readline = require("readline");
const { loadState, saveState } = require("./state-utils");

// ─── 설정 ────────────────────────────────────────────────────────────────────

const CONFIG = {
  // 복잡도 신호 가중치
  signals: {
    multiFileWork:  { weight: 2, desc: "다중 파일 작업" },
    complexKeyword: { weight: 2, desc: "복잡도 키워드" },
    repeatedErrors: { weight: 3, desc: "반복 오류" },
    largeFileLoad:  { weight: 2, desc: "대형 파일 로드" },
    largeOutput:    { weight: 1, desc: "대용량 출력" },
  },

  // 안쏠림 발동 임계값
  leanThreshold:    3,   // 가중치 합 ≥ 3
  contextThreshold: 30,  // 컨텍스트 ≥ 30%
  cooldownTurns:    10,  // 발동 후 쿨다운 턴 수

  // 복잡도 키워드
  complexKeywords: [
    "refactor", "리팩토링", "아키텍처", "architecture",
    "migration", "마이그레이션", "redesign", "재설계",
    "overhaul", "restructure", "전면", "전체",
  ],
};

// ─── 신호 감지 ────────────────────────────────────────────────────────────────

function detectSignals(state, event) {
  const triggered = [];
  let totalWeight = 0;

  // 1. 다중 파일 작업 (fileLoadsCount ≥ 3)
  if (state.fileLoadsCount >= 3) {
    triggered.push("multiFileWork");
    totalWeight += CONFIG.signals.multiFileWork.weight;
  }

  // 2. 복잡도 키워드 (도구 입력에서만 감지 — tool_response는 파일 내용이므로 제외)
  const inputText = JSON.stringify(event.tool_input ?? "").toLowerCase();
  const hasComplexKeyword = CONFIG.complexKeywords.some((kw) =>
    inputText.includes(kw.toLowerCase())
  );
  if (hasComplexKeyword) {
    triggered.push("complexKeyword");
    totalWeight += CONFIG.signals.complexKeyword.weight;
  }

  // 3. 반복 오류 (danger/critical 경고가 2회 이상 누적)
  const dangerWarnings = (state.warningHistory ?? []).filter(
    (w) => w.level === "danger" || w.level === "critical"
  ).length;
  if (dangerWarnings >= 2) {
    triggered.push("repeatedErrors");
    totalWeight += CONFIG.signals.repeatedErrors.weight;
  }

  // 4. 대형 파일 로드 (Read 도구 + 출력 300줄 이상)
  if (event.tool_name === "Read") {
    const output = event.tool_response?.output ?? "";
    const lineCount = output.split("\n").length;
    if (lineCount >= 300) {
      triggered.push("largeFileLoad");
      totalWeight += CONFIG.signals.largeFileLoad.weight;
    }
  }

  // 5. 대용량 출력 (응답 3,000자 이상)
  // largeFileLoad가 이미 발동된 경우 중복 계산 방지 (대형 Read는 두 신호 모두 유발)
  if (!triggered.includes("largeFileLoad")) {
    const outputLength = JSON.stringify(event.tool_response ?? "").length;
    if (outputLength >= 3000) {
      triggered.push("largeOutput");
      totalWeight += CONFIG.signals.largeOutput.weight;
    }
  }

  return { triggered, totalWeight };
}

// ─── 컨텍스트 사용량 계산 ─────────────────────────────────────────────────────

function getContextPct(state) {
  return Math.round((state.estimatedTokens / 200000) * 100);
}

// ─── 쿨다운 확인 ─────────────────────────────────────────────────────────────

function isInCooldown(state) {
  const lastLean = state.lastLeanTurn ?? 0;
  if (lastLean === 0) return false; // 한 번도 발동하지 않은 상태는 쿨다운이 아님
  return (state.turnCount - lastLean) < CONFIG.cooldownTurns;
}

// ─── 안전 모드 메시지 ─────────────────────────────────────────────────────────

function buildSafetyModeMessage(triggered, totalWeight, contextPct) {
  const signalList = triggered
    .map((s) => `│   · ${CONFIG.signals[s].desc} (가중치 ${CONFIG.signals[s].weight})`)
    .join("\n");

  return [
    ``,
    `┌─ 🏯 공포 안쏠림 — 복잡도 선제 감지 ──────────────┐`,
    `│ 복잡도 가중치: ${totalWeight} / ${CONFIG.leanThreshold} (임계값)`,
    `│ 컨텍스트:     ${contextPct}%`,
    `│`,
    `│ 감지된 신호:`,
    signalList,
    `│`,
    `│ 안전 모드 전환:`,
    `│   1. 태스크를 더 작은 단위로 분해하세요`,
    `│   2. iterative-retrieval 적용 (서브에이전트 호출 전)`,
    `│   3. 현재 단계 완료 후 컨텍스트 압축 예약`,
    `└───────────────────────────────────────────────┘`,
    ``,
  ].join("\n");
}

// ─── 메인 로직 ────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let raw = "";
  for await (const line of rl) { raw += line; }

  let event = {};
  try {
    event = JSON.parse(raw);
  } catch (_) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // 상태 로드 (context-watch.js가 이미 업데이트한 상태를 읽음)
  const state = loadState();

  // 컨텍스트 30% 미만이면 안쏠림 불필요
  const contextPct = getContextPct(state);
  if (contextPct < CONFIG.contextThreshold) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // 쿨다운 중이면 건너뜀
  if (isInCooldown(state)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // TDD RED/GREEN 단계에서는 개입하지 않음
  const tddPhase = state.currentTddPhase;
  if (tddPhase === "RED" || tddPhase === "GREEN") {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // 복잡도 신호 감지
  const { triggered, totalWeight } = detectSignals(state, event);

  // 임계값 도달 시 안전 모드 발동
  if (totalWeight >= CONFIG.leanThreshold) {
    state.lastLeanTurn = state.turnCount;
    saveState(state);

    const msg = buildSafetyModeMessage(triggered, totalWeight, contextPct);
    process.stderr.write(msg);
  }

  process.stdout.write(JSON.stringify({ continue: true }));
}

main().catch((err) => {
  process.stderr.write(`[lean-detector] 오류: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
});
