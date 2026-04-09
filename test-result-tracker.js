#!/usr/bin/env node

/**
 * test-result-tracker.js
 *
 * 공포(栱包) 하네스 — 첨차 게이트
 *
 * 역할: Bash 실행 후 pytest 결과를 분석하여
 *       현재 TDD 단계(RED/GREEN)를 정확히 추적한다.
 *       context-guardian이 TDD 보호 여부를 판단하는 근거가 된다.
 *
 * Claude Code Hook 이벤트: PostToolUse (Bash)
 */

const readline = require("readline");
const { loadState, saveState } = require("./state-utils");

function analyzePytestOutput(output) {
  if (!output) return null;

  // pytest 실행 여부 확인 (구체적인 패턴으로 오탐 방지)
  const isPytest = output.includes("pytest") ||
                   /\d+ (passed|failed|error)/.test(output) ||
                   /PASSED.*::|FAILED.*::/.test(output);

  if (!isPytest) return null;

  // 결과 분류
  const allPassed = /\d+ passed/.test(output) && !/\d+ failed/.test(output) && !/\d+ error/.test(output);
  const hasFailed = /\d+ failed/.test(output) || /FAILED.*::/.test(output);
  const hasError  = /\d+ error/.test(output)  || /ERROR.*::/.test(output);

  // 커버리지 추출
  const coverageMatch = output.match(/TOTAL\s+\d+\s+\d+\s+(\d+)%/);
  const coverage = coverageMatch ? parseInt(coverageMatch[1]) : null;

  // 실패/에러 수 추출
  const failedMatch = output.match(/(\d+) failed/);
  const failedCount = failedMatch ? parseInt(failedMatch[1]) : 0;

  const passedMatch = output.match(/(\d+) passed/);
  const passedCount = passedMatch ? parseInt(passedMatch[1]) : 0;

  if (allPassed) {
    return { phase: "GREEN", passedCount, failedCount: 0, coverage };
  } else if (hasFailed || hasError) {
    return { phase: "RED", passedCount, failedCount, coverage };
  }

  return null;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let raw = "";
  for await (const line of rl) { raw += line; }

  let event = {};
  try { event = JSON.parse(raw); } catch (_) {}

  const output = event.tool_response?.output ?? "";
  const result = analyzePytestOutput(output);

  if (result) {
    // 공유 상태 로드 — 기존 필드(turnCount 등) 보존
    const state = loadState();
    const prevPhase = state.currentTddPhase;
    state.currentTddPhase = result.phase;
    state.lastTestResult  = {
      phase:      result.phase,
      passed:     result.passedCount,
      failed:     result.failedCount,
      coverage:   result.coverage,
      time:       new Date().toISOString(),
    };
    saveState(state);

    // 단계 전환 알림
    if (prevPhase !== result.phase) {
      const icons = { RED: "🔴", GREEN: "🟢" };
      const icon  = icons[result.phase] ?? "🔵";
      const coverageNote = result.coverage !== null
        ? `커버리지: ${result.coverage}%${result.coverage < 80 ? " ⚠️ (기준 80% 미달)" : " ✅"}`
        : "";

      process.stderr.write([
        ``,
        `┌─ 🏯 공포 첨차 게이트 ─────────────────────────────┐`,
        `│ TDD 단계 전환: ${prevPhase ?? "시작"} → ${icon} ${result.phase}`,
        `│ 통과: ${result.passedCount}개  실패: ${result.failedCount}개`,
        coverageNote ? `│ ${coverageNote}` : "",
        `│`,
        result.phase === "GREEN"
          ? `│ ✅ 모든 테스트 통과 — REFACTOR 단계로 진행하세요.`
          : `│ 🔴 테스트 실패 — GREEN이 될 때까지 구현을 수정하세요.`,
        `└───────────────────────────────────────────────┘`,
        ``,
      ].filter(Boolean).join("\n"));
    }
  }

  process.stdout.write(JSON.stringify({ continue: true }));
}

main().catch((err) => {
  process.stderr.write(`[test-result-tracker] 오류: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
});
