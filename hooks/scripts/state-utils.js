#!/usr/bin/env node

/**
 * state-utils.js
 *
 * 공포(栱包) 하네스 — 공유 상태 유틸리티
 *
 * context-watch, test-result-tracker, session-start, session-end가
 * 동일한 상태 파일(.gongpo/context-state.json)을 공유한다.
 * 각 훅이 독립적인 loadState/saveState를 구현하면 필드 누락으로
 * 상태가 손상되므로 이 모듈로 중앙화한다.
 *
 * 사용법:
 *   const { loadState, saveState } = require("./state-utils");
 */

const fs   = require("fs");
const path = require("path");

const STATE_FILE = path.join(process.cwd(), ".gongpo", "context-state.json");

const DEFAULT_STATE = {
  turnCount:        0,
  fileLoadsCount:   0,
  largeOutputCount: 0,
  estimatedTokens:  0,
  lastCompactTurn:  0,
  lastLeanTurn:     0,
  currentTddPhase:  null,
  sessionStartTime: null,
  warningHistory:   [],
  lastTestResult:   null,
  _reductionPct:    0,
};

/**
 * 상태 파일을 로드한다.
 * 파일이 없거나 손상된 경우 기본값을 반환한다.
 * 기존 파일에 필드가 누락된 경우 기본값으로 채워 반환한다 (merge).
 */
function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { ...DEFAULT_STATE, sessionStartTime: new Date().toISOString() };
  }

  let raw;
  try {
    raw = fs.readFileSync(STATE_FILE, "utf8");
  } catch (err) {
    process.stderr.write(`[state-utils] 상태 파일 읽기 실패: ${err.message}\n`);
    return { ...DEFAULT_STATE, sessionStartTime: new Date().toISOString() };
  }

  try {
    const parsed = JSON.parse(raw);
    // 기본값과 병합 — 누락 필드 보완, 기존 값 유지
    return { ...DEFAULT_STATE, ...parsed };
  } catch (err) {
    process.stderr.write(`[state-utils] 상태 파일 손상 — 초기화합니다: ${err.message}\n`);
    return { ...DEFAULT_STATE, sessionStartTime: new Date().toISOString() };
  }
}

/**
 * 상태를 파일에 저장한다.
 * 디렉토리가 없으면 자동 생성한다.
 */
function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * 상태를 초기화한다 (세션 시작 시 호출).
 */
function resetState() {
  const fresh = {
    ...DEFAULT_STATE,
    sessionStartTime: new Date().toISOString(),
  };
  saveState(fresh);
  return fresh;
}

module.exports = { loadState, saveState, resetState, STATE_FILE, DEFAULT_STATE };
