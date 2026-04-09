#!/usr/bin/env node

/**
 * session-start.js
 *
 * 공포(栱包) 하네스 — 세션 시작 훅
 *
 * 역할: 새 세션 시작 시 이전 체크포인트를 불러와
 *       "방금 뭘 하고 있었더라?" 상태를 방지한다.
 *
 * Claude Code Hook 이벤트: SessionStart
 * stdin: { session_id, ... }
 * stdout: { continue: true }
 */

const fs   = require("fs");
const path = require("path");

const CHECKPOINT_DIR = path.join(process.cwd(), ".gongpo", "checkpoints");
const STATE_FILE     = path.join(process.cwd(), ".gongpo", "context-state.json");
const LATEST         = path.join(CHECKPOINT_DIR, "latest.md");

function resetContextState() {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const freshState = {
    turnCount:         0,
    fileLoadsCount:    0,
    largeOutputCount:  0,
    estimatedTokens:   0,
    lastCompactTurn:   0,
    currentTddPhase:   null,
    sessionStartTime:  new Date().toISOString(),
    warningHistory:    [],
  };

  fs.writeFileSync(STATE_FILE, JSON.stringify(freshState, null, 2));
  return freshState;
}

function loadLatestCheckpoint() {
  if (!fs.existsSync(LATEST)) return null;
  try {
    return fs.readFileSync(LATEST, "utf8");
  } catch (_) {
    return null;
  }
}

function formatRestorationBanner(checkpoint) {
  const lines = checkpoint.split("\n");

  // 체크포인트에서 핵심 섹션 추출
  const sections = {
    inProgress: extractSection(lines, "## 현재 진행 중"),
    nextTasks:  extractSection(lines, "## 다음 할 일"),
    keyContext: extractSection(lines, "## 핵심 컨텍스트"),
  };

  return [
    ``,
    `┌─ 🏯 공포 하네스 — 세션 복원 ─────────────────────┐`,
    `│ 이전 체크포인트를 발견했습니다.`,
    `│`,
    sections.inProgress
      ? `│ 진행 중이던 작업:\n${indent(sections.inProgress, "│   ")}`
      : `│ 진행 중인 작업: 없음`,
    `│`,
    sections.nextTasks
      ? `│ 다음 할 일:\n${indent(sections.nextTasks, "│   ")}`
      : "",
    `│`,
    `│ 전체 체크포인트: .gongpo/checkpoints/latest.md`,
    `└───────────────────────────────────────────────┘`,
    ``,
  ].filter(Boolean).join("\n");
}

function extractSection(lines, header) {
  const start = lines.findIndex((l) => l.startsWith(header));
  if (start === -1) return null;

  const result = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) break;
    if (lines[i].trim()) result.push(lines[i]);
    if (result.length >= 5) { result.push("  ..."); break; }
  }
  return result.length ? result.join("\n") : null;
}

function indent(text, prefix) {
  return text.split("\n").map((l) => prefix + l).join("\n");
}

function ensureGongpoDirs() {
  for (const dir of [CHECKPOINT_DIR, path.dirname(STATE_FILE)]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

async function main() {
  ensureGongpoDirs();

  // 새 세션마다 컨텍스트 상태 초기화
  resetContextState();

  // 이전 체크포인트 확인
  const checkpoint = loadLatestCheckpoint();

  if (checkpoint) {
    const banner = formatRestorationBanner(checkpoint);
    process.stderr.write(banner);
  } else {
    process.stderr.write([
      ``,
      `┌─ 🏯 공포 하네스 ─────────────────────────────────┐`,
      `│ 새 세션을 시작합니다.`,
      `│ 컨텍스트 감시가 활성화되었습니다.`,
      `│ 임계값: 🟡 40%  🟠 50%  🔴 70%  ⛔ 80%`,
      `└───────────────────────────────────────────────┘`,
      ``,
    ].join("\n"));
  }

  process.stdout.write(JSON.stringify({ continue: true }));
}

main().catch((err) => {
  process.stderr.write(`[session-start] 오류: ${err.message}\n`);
  process.stdout.write(JSON.stringify({ continue: true }));
});
