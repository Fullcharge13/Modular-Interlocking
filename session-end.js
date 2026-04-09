#!/usr/bin/env node

/**
 * session-end.js
 *
 * 공포(栱包) 하네스 — 세션 종료 훅
 *
 * 역할: 세션이 끝날 때 자동으로 체크포인트를 저장한다.
 *       다음 세션이 "방금 뭘 하고 있었더라?" 없이 시작되도록 보장한다.
 *
 * Claude Code Hook 이벤트: Stop
 * stdin: { session_id, stop_reason, ... }
 * stdout: { continue: true }
 */

const readline = require("readline");
const fs       = require("fs");
const path     = require("path");
const { loadState } = require("./state-utils");

const CHECKPOINT_DIR  = path.join(process.cwd(), ".gongpo", "checkpoints");
const LATEST_LINK     = path.join(CHECKPOINT_DIR, "latest.md");

// ─── 체크포인트 생성 ──────────────────────────────────────────────────────────

function buildCheckpoint(state, stopReason) {
  const now       = new Date().toISOString().replace("T", " ").slice(0, 16);
  const pct       = state
    ? Math.round((state.estimatedTokens / 200000) * 100)
    : 0;
  const tddPhase  = state?.currentTddPhase ?? "알 수 없음";
  const turnCount = state?.turnCount ?? 0;

  return `# 체크포인트
생성 시각: ${now}
세션 종료 사유: ${stopReason ?? "정상 종료"}
컨텍스트 사용량: 약 ${pct}%
총 턴 수: ${turnCount}회
TDD 단계: ${tddPhase}

---

## 완료된 태스크
<!-- session-end가 자동 생성. 수동으로 채워주세요. -->
- (이번 세션에서 완료한 것을 기록하세요)

## 현재 진행 중
<!-- 중단된 작업 -->
- 태스크: (기록하세요)
- 단계: ${tddPhase}
- 파일: (기록하세요)
- 마지막 상태: (기록하세요)

## 다음 할 일 (우선순위 순)
- [ ] (다음 태스크 1)
- [ ] (다음 태스크 2)
- [ ] (다음 태스크 3)

## 핵심 컨텍스트 (다음 세션에서 반드시 복원)

### 인터페이스
\`\`\`python
# 현재 작업 중인 인터페이스를 여기에 붙여넣으세요
\`\`\`

### 중요 파일 경로
- 구현: (경로)
- 테스트: (경로)

### 열린 결정
- (아직 결정하지 못한 것들)

## 마지막 실패 정보
\`\`\`
(실패 중인 테스트가 있다면 에러 메시지를 여기에)
\`\`\`

---
*공포(栱包) 하네스 자동 생성 — 수동으로 내용을 보완하세요*
`;
}

// ─── 메인 로직 ────────────────────────────────────────────────────────────────

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let raw = "";
  for await (const line of rl) { raw += line; }

  let event = {};
  try { event = JSON.parse(raw); } catch (_) {}

  const state      = loadState();
  const stopReason = event.stop_reason ?? "user_exit";

  // 체크포인트 디렉토리 보장
  if (!fs.existsSync(CHECKPOINT_DIR)) {
    fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
  }

  // 타임스탬프 기반 체크포인트 파일
  const ts       = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const filename = `checkpoint_${ts}.md`;
  const filepath = path.join(CHECKPOINT_DIR, filename);

  const content = buildCheckpoint(state, stopReason);

  // 파일 저장
  fs.writeFileSync(filepath, content);

  // latest.md 갱신 (심볼릭 링크 대신 복사 — 크로스 플랫폼 호환)
  fs.writeFileSync(LATEST_LINK, content);

  // 세션 요약 출력
  const pct = state
    ? Math.round((state.estimatedTokens / 200000) * 100)
    : 0;

  process.stderr.write([
    ``,
    `┌─ 🏯 공포 하네스 — 세션 종료 ─────────────────────┐`,
    `│ 체크포인트 저장 완료`,
    `│ 파일: .gongpo/checkpoints/${filename}`,
    `│`,
    `│ 세션 요약:`,
    `│   총 턴 수:      ${state?.turnCount ?? 0}회`,
    `│   컨텍스트:      약 ${pct}%`,
    `│   파일 로드:     ${state?.fileLoadsCount ?? 0}개`,
    `│   TDD 단계:      ${state?.currentTddPhase ?? "없음"}`,
    `│`,
    `│ 다음 세션에서 자동으로 복원됩니다.`,
    `└───────────────────────────────────────────────┘`,
    ``,
  ].join("\n"));

  process.stdout.write(JSON.stringify({ continue: true }));
}

main().catch((err) => {
  process.stderr.write(`[session-end] 오류: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
});
