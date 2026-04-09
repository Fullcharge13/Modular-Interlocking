#!/usr/bin/env node

/**
 * context-watch.js
 *
 * 공포(栱包) 하네스 — 컨텍스트 감시 훅
 *
 * 역할: PostToolUse 이벤트마다 컨텍스트 상태를 평가하고,
 *       임계값 도달 시 context-guardian 에이전트를 깨운다.
 *
 * 주두 원칙: 컨텍스트가 기둥을 약화시키기 전에 분산한다.
 * 못 원칙:   이 스크립트는 어떤 에이전트 코드도 직접 수정하지 않는다.
 *            이벤트를 발행하고, 에이전트가 반응하게 한다.
 *
 * Claude Code Hook 이벤트: PostToolUse
 * stdin: { tool_name, tool_input, tool_response, session_id }
 * stdout: { continue: true } | { continue: false, stop_reason: "..." }
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");

// ─── 설정 ────────────────────────────────────────────────────────────────────

const CONFIG = {
  // 임계값 (rules/common/context-budget.md와 동기화)
  thresholds: {
    caution: 40,   // 🟡 주의: 신규 파일 로드 자제 권고
    warning: 50,   // 🟠 경고: compact-trigger 실행
    danger:  70,   // 🔴 위험: 작업 중단 후 강제 압축
    critical: 80,  // ⛔ 중단: 새 작업 차단
  },

  // 컨텍스트 추정 가중치 (토큰 단위)
  weights: {
    perTurn:         800,   // 대화 1턴당 평균 토큰
    perFileLoad:    2000,   // 파일 1개 로드당 평균 토큰
    perLargeOutput: 1500,   // 대용량 출력 (코드 생성 등)
    maxContext:   200000,   // Claude의 최대 컨텍스트 윈도우
  },

  // 상태 파일 경로
  stateFile: path.join(process.cwd(), ".gongpo", "context-state.json"),
  checkpointDir: path.join(process.cwd(), ".gongpo", "checkpoints"),

  // TDD 보호 — 이 단계에서는 압축 개입 금지
  tddProtectedPhases: ["RED", "GREEN"],
};

// ─── 상태 관리 ────────────────────────────────────────────────────────────────

function loadState() {
  try {
    if (fs.existsSync(CONFIG.stateFile)) {
      return JSON.parse(fs.readFileSync(CONFIG.stateFile, "utf8"));
    }
  } catch (_) {}

  return {
    turnCount: 0,
    fileLoadsCount: 0,
    largeOutputCount: 0,
    estimatedTokens: 0,
    lastCompactTurn: 0,
    currentTddPhase: null,   // null | "RED" | "GREEN" | "REFACTOR"
    sessionStartTime: new Date().toISOString(),
    warningHistory: [],
  };
}

function saveState(state) {
  const dir = path.dirname(CONFIG.stateFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG.stateFile, JSON.stringify(state, null, 2));
}

// ─── 컨텍스트 사용량 추정 ─────────────────────────────────────────────────────

function estimateContextPct(state, event) {
  const { weights } = CONFIG;

  // 이벤트 유형별 토큰 추가
  let additionalTokens = weights.perTurn;

  if (event.tool_name === "Read" || event.tool_name === "Write") {
    additionalTokens += weights.perFileLoad;
    state.fileLoadsCount += 1;
  }

  if (event.tool_name === "Bash") {
    const output = event.tool_response?.output ?? "";
    if (output.length > 2000) {
      additionalTokens += weights.perLargeOutput;
      state.largeOutputCount += 1;
    }
  }

  state.estimatedTokens += additionalTokens;
  state.turnCount += 1;

  const pct = Math.round((state.estimatedTokens / weights.maxContext) * 100);
  return Math.min(pct, 99); // 100%는 완전 차단 상태
}

// ─── TDD 단계 감지 ────────────────────────────────────────────────────────────

function detectTddPhase(event) {
  const output = (event.tool_response?.output ?? "").toLowerCase();
  const input  = JSON.stringify(event.tool_input ?? "").toLowerCase();
  const combined = output + input;

  if (combined.includes("failing") || combined.includes("assert") ||
      combined.includes("error") || combined.includes("failed")) {
    return "RED";
  }
  if (combined.includes("passed") || combined.includes("green") ||
      combined.includes("all passed")) {
    return "GREEN";
  }
  if (combined.includes("refactor") || combined.includes("ruff") ||
      combined.includes("mypy")) {
    return "REFACTOR";
  }
  return null;
}

// ─── 경고 메시지 생성 ─────────────────────────────────────────────────────────

function buildWarningMessage(pct, state, level) {
  const bar = buildProgressBar(pct);
  const turnsSinceCompact = state.turnCount - state.lastCompactTurn;
  const tddNote = CONFIG.tddProtectedPhases.includes(state.currentTddPhase)
    ? `\n⚠️  TDD ${state.currentTddPhase} 단계 진행 중 — 현재 단계 완료 후 압축`
    : "";

  const actions = {
    caution:  "신규 파일 로드를 자제하세요.",
    warning:  "compact-trigger skill을 실행합니다.",
    danger:   "현재 작업을 완료 후 즉시 /compact 를 실행하세요.",
    critical: "새 작업 시작을 차단합니다. 즉시 /compact 가 필요합니다.",
  };

  return [
    ``,
    `┌─ 🏯 공포 컨텍스트 감시 ─────────────────────────┐`,
    `│ 사용량:  ${bar} ${pct}%`,
    `│ 상태:    ${levelIcon(level)} ${levelLabel(level)}`,
    `│ 턴 수:   ${state.turnCount}회 (마지막 압축으로부터 ${turnsSinceCompact}턴)`,
    `│ 파일:    ${state.fileLoadsCount}개 로드됨`,
    `│`,
    `│ 권장 행동: ${actions[level]}${tddNote}`,
    `└───────────────────────────────────────────────┘`,
    ``,
  ].join("\n");
}

function buildProgressBar(pct) {
  const filled = Math.round(pct / 5);
  const empty  = 20 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function levelIcon(level) {
  return { caution: "🟡", warning: "🟠", danger: "🔴", critical: "⛔" }[level];
}

function levelLabel(level) {
  return {
    caution:  "주의 — 절약 모드",
    warning:  "경고 — 압축 권장",
    danger:   "위험 — 압축 필요",
    critical: "중단 — 즉시 압축",
  }[level];
}

// ─── 메인 로직 ────────────────────────────────────────────────────────────────

async function main() {
  // stdin에서 Claude Code 이벤트 수신
  const rl = readline.createInterface({ input: process.stdin });
  let raw = "";

  for await (const line of rl) {
    raw += line;
  }

  let event = {};
  try {
    event = JSON.parse(raw);
  } catch (_) {
    // 파싱 실패 시 통과 (훅 오류로 세션 중단 방지)
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // 상태 로드
  const state = loadState();

  // TDD 단계 갱신
  const detectedPhase = detectTddPhase(event);
  if (detectedPhase) {
    state.currentTddPhase = detectedPhase;
  }

  // 컨텍스트 사용량 추정
  const pct = estimateContextPct(state, event);

  // 임계값 판단
  const { thresholds } = CONFIG;
  let level = null;
  let shouldBlock = false;

  if      (pct >= thresholds.critical) { level = "critical"; shouldBlock = true; }
  else if (pct >= thresholds.danger)   { level = "danger"; }
  else if (pct >= thresholds.warning)  { level = "warning"; }
  else if (pct >= thresholds.caution)  { level = "caution"; }

  // 상태 저장
  if (level) {
    state.warningHistory.push({
      turn: state.turnCount,
      pct,
      level,
      time: new Date().toISOString(),
    });
  }
  saveState(state);

  // 출력
  if (level) {
    const msg = buildWarningMessage(pct, state, level);

    // Claude Code의 stderr는 사용자에게 표시됨
    process.stderr.write(msg);

    // critical 레벨: 새 작업 차단 (TDD 보호 단계 제외)
    if (shouldBlock && !CONFIG.tddProtectedPhases.includes(state.currentTddPhase)) {
      process.stdout.write(JSON.stringify({
        continue: false,
        stop_reason: `컨텍스트 ${pct}% 도달 — 즉시 /compact 실행 후 재개하세요.`,
      }));
      return;
    }
  }

  // 기본: 계속 진행
  process.stdout.write(JSON.stringify({ continue: true }));
}

main().catch((err) => {
  // 오류 시 세션 중단하지 않음 — 훅은 보조 도구
  process.stderr.write(`[context-watch] 오류: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
});
