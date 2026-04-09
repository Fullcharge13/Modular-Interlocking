#!/usr/bin/env node

/**
 * pre-edit-guard.js
 *
 * 공포(栱包) 하네스 — 결구 게이트
 *
 * 역할: Python 파일을 수정하기 전에 대응하는 테스트 파일이
 *       존재하는지 확인한다. 테스트 없는 코드 작성을 물리적으로 차단.
 *
 * 예외:
 * - 테스트 파일 자체 수정 (tests/ 디렉토리)
 * - 설정 파일 (setup.py, pyproject.toml, conftest.py)
 * - __init__.py
 *
 * Claude Code Hook 이벤트: PreToolUse (Write, Edit, MultiEdit)
 */

const readline = require("readline");
const fs       = require("fs");
const path     = require("path");

// 테스트 파일 없이 수정 허용하는 패턴
const EXEMPT_PATTERNS = [
  /tests?\//,
  /conftest\.py$/,
  /setup\.py$/,
  /pyproject\.toml$/,
  /__init__\.py$/,
  /migrations?\//,
];

function isExempt(filePath) {
  return EXEMPT_PATTERNS.some((p) => p.test(filePath));
}

function findTestFile(srcPath) {
  // src/domain/user_service.py → tests/unit/test_user_service.py
  const basename  = path.basename(srcPath, ".py");
  const testName  = `test_${basename}.py`;
  const cwd       = process.cwd();

  // 가능한 테스트 경로 목록
  const candidates = [
    path.join(cwd, "tests", "unit",        testName),
    path.join(cwd, "tests", "integration", testName),
    path.join(cwd, "tests",                testName),
    path.join(cwd, "test",                 testName),
    // 같은 디렉토리의 tests/ 서브폴더
    path.join(path.dirname(srcPath), "tests", testName),
  ];

  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin });
  let raw = "";
  for await (const line of rl) { raw += line; }

  let event = {};
  try { event = JSON.parse(raw); } catch (_) {}

  const filePath = event.tool_input?.file_path ?? "";

  // Python 파일이 아니거나 예외 파일이면 통과
  if (!filePath.endsWith(".py") || isExempt(filePath)) {
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // 신규 파일 생성인 경우 — 테스트 파일을 먼저 만들도록 안내
  const isNewFile = !fs.existsSync(filePath);
  if (isNewFile) {
    const basename = path.basename(filePath, ".py");
    process.stderr.write([
      ``,
      `┌─ 🏯 공포 결구 게이트 ─────────────────────────────┐`,
      `│ 새 Python 파일 감지: ${path.basename(filePath)}`,
      `│`,
      `│ TDD 철의 법칙: 테스트를 먼저 작성하세요.`,
      `│`,
      `│ 권장 순서:`,
      `│   1. tests/unit/test_${basename}.py 작성 (RED)`,
      `│   2. pytest 실행 → FAILED 확인`,
      `│   3. ${path.basename(filePath)} 구현 (GREEN)`,
      `└───────────────────────────────────────────────┘`,
      ``,
    ].join("\n"));

    // 경고만 하고 차단하지 않음 — 사용자가 인지하고 진행하도록
    process.stdout.write(JSON.stringify({ continue: true }));
    return;
  }

  // 기존 파일 수정 — 테스트 파일 존재 확인
  const testFile = findTestFile(filePath);
  if (!testFile) {
    process.stderr.write([
      ``,
      `┌─ 🏯 공포 결구 게이트 ─────────────────────────────┐`,
      `│ ⚠️  테스트 파일 없음: ${path.basename(filePath)}`,
      `│`,
      `│ 대응하는 테스트 파일을 찾을 수 없습니다.`,
      `│ 수정을 진행하기 전에 테스트를 작성하는 것을 권장합니다.`,
      `│`,
      `│ tdd-guide 에이전트에게 위임하거나`,
      `│ 직접 테스트를 먼저 작성해주세요.`,
      `└───────────────────────────────────────────────┘`,
      ``,
    ].join("\n"));
  }

  // 경고 후 진행 허용 (완전 차단은 사용자 경험을 해침)
  process.stdout.write(JSON.stringify({ continue: true }));
}

main().catch((err) => {
  process.stderr.write(`[pre-edit-guard] 오류: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
});
