# 공포(栱包) 에이전트 하네스 — 완전 기술 명세서 v2.2

> **"못 하나 없이 수십 톤을 버티는 구조"**
>
> 한국 전통 건축의 역학 원리를 Claude Code 에이전트 워크플로우에 이식한
> Python 개발 특화 성능 최적화 시스템.
>
> 레포: [Modular-Interlocking](https://github.com/Fullcharge13/Modular-Interlocking)
> 버전: v2.2 (전체 디버깅 2라운드 완료 — 버그 9개 수정)

---

## 목차

1. [건축 원리 전체 매핑](#1-건축-원리-전체-매핑)
2. [시스템 5층 구조](#2-시스템-5층-구조)
3. [Layer 0 — 지반 기초 계층](#3-layer-0--지반-기초-계층)
4. [Layer 1 — 결구 Rules](#4-layer-1--결구-rules)
5. [Layer 2 — 주두 Skills](#5-layer-2--주두-skills)
6. [Layer 3 — 첨차 Agents](#6-layer-3--첨차-agents)
7. [Layer 4 — 공포 완성 Hooks](#7-layer-4--공포-완성-hooks)
8. [전체 파일 목록](#8-전체-파일-목록)
9. [디버깅 기록](#9-디버깅-기록)
10. [최적화 로드맵](#10-최적화-로드맵)
11. [설치 및 워크플로우](#11-설치-및-워크플로우)
12. [버전 히스토리](#12-버전-히스토리)

---

## 1. 건축 원리 전체 매핑

### 1.1 지반 기술 → 하네스 기초 계층 (Layer 0, 신규)

| 건축 기법 | 역학적 역할 | 하네스 적용 | 상태 |
|---|---|---|---|
| **판축 (板築)** | 층층이 다져 암반 강도 확보 | 환경 검증 게이트 — Node.js·Python 버전, 권한, 의존성 | 로드맵 |
| **기단 (基壇)** | 지면 격리, 습기·침식 차단 | 외부 MCP/API 격리 — 오염원 차단 | 로드맵 |
| **그랭이질** | 자연석 굴곡에 기둥 밑면 정밀 맞춤 | 프로젝트 프로파일 자동 감지 (session-start.js) | ✅ Sprint 5 |
| **지반 혼합** | 자갈·돌·흙 최적 비율 배합 | 언어·프레임워크 최적 조합 자동 감지 | 로드맵 |

### 1.2 공포 부재 → 에이전트 계층

| 부재명 | 역학적 역할 | 하네스 적용 | 상태 |
|---|---|---|---|
| **주두 (柱頭)** | 상부 하중 받침, 접촉 면적 확대 | Skills 계층 — 최소 컨텍스트 분산 | ✅ Sprint 2 |
| **첨차 (檐遮)** | 하중 좌우 분산 가로 부재 | Agents 계층 — 병렬 격리 실행 | ✅ Sprint 3 |
| **살미 (Salmi)** | 처마를 안팎으로 받치는 돌출 부재 | 에이전트 확장 브리지 (도메인 간 연결) | 로드맵 |
| **소로 (Soro)** | 부재 사이 하중 전달 작은 받침목 | agent-handoff 표준 객체 | 로드맵 |

### 1.3 고급 역학 기법 → 훅 계층

| 건축 기법 | 역학적 원리 | 하네스 적용 | 상태 |
|---|---|---|---|
| **귀솟음** | 끝으로 갈수록 기둥 높이 증가 | 적응형 임계값 — 턴 수에 따라 caution 자동 하향 | ✅ Sprint 5 |
| **안쏠림** | 기둥 상단을 미리 안쪽으로 기울여 외력 선제 저항 | Failure Lean — 복잡도 감지 시 안전 모드 선제 전환 | ✅ Sprint 5 |
| **배흘림** | 기둥 중간을 굵게 하여 좌굴 저항 | Context Shape — 세션 중반 핵심 컨텍스트 집중 | 로드맵 |
| **다포 양식** | 기둥 사이 공포 추가 배치 | Inter-agent 보조층 | 로드맵 |
| **하앙 기법** | 경사 부재로 지렛대 원리 | Leverage Context — 인터페이스 앵커로 컨텍스트 최소화 | 로드맵 |

---

## 2. 시스템 5층 구조

```
인간의 의도 (지붕 하중)
        │
        ▼
Layer 4: Hooks      (공포 완성) — 이벤트 기반 층간 자동 연결
        │
        ▼
Layer 3: Agents     (첨차)     — 독립 실행, 단일 역할, 실패 격리
        │
        ▼
Layer 2: Skills     (주두)     — 도메인 지식 분산, 최소 컨텍스트
        │
        ▼
Layer 1: Rules      (결구)     — 불변 기반 규칙, 재해석 금지
        │
        ▼
Layer 0: Foundation (지반)     — 환경 검증, 격리, 적응형 기초
        │
        ▼
Claude Code 런타임 (기둥)
```

---

## 3. Layer 0 — 지반 기초 계층

**판축 (板築) — 환경 검증 게이트** (로드맵)

```
검증 순서:
1. Node.js ≥ 18 확인
2. Python ≥ 3.11 확인
3. .gongpo/ 디렉토리 쓰기 권한 확인
4. hooks/scripts/ 실행 권한 확인
5. pytest 설치 여부 확인
```

**기단 (基壇) — 외부 의존성 격리** (로드맵)

```
격리 대상:
- 불안정한 외부 MCP 서버
- 런타임 환경 변수 변화
- 파일 시스템 상태 (세션 시작 스냅샷, 종료 시 diff 기록)
```

**그랭이질 — 프로젝트 프로파일 자동 감지** ✅ (session-start.js에 구현됨)

---

## 4. Layer 1 — 결구 Rules

### `rules/common/context-budget.md` ★

| 임계값 | 상태 | 행동 |
|---|---|---|
| 0–40% | 🟢 정상 | 자유 작업 |
| 40–50% | 🟡 주의 | 파일 로드 자제 |
| 50–65% | 🟠 경고 | compact-trigger 실행 |
| 65–80% | 🔴 위험 | 체크포인트 후 압축 |
| 80%+ | ⛔ 중단 | 즉시 압축, 신규 작업 금지 |

### `rules/common/tdd.md`

TDD 철의 법칙. RED → GREEN → REFACTOR, 예외 없음.

### `rules/common/git.md`

브랜치 격리 + TDD 커밋 리듬.

### `rules/python/style.md` + `rules/python/testing.md`

타입 힌트 필수, 함수 30줄 이하, Given-When-Then 구조, 커버리지 80%+.

---

## 5. Layer 2 — 주두 Skills

### `skills/context-sentinel/` ★

```
발동 조건:
- 컨텍스트 40% 도달
- 대화 15턴 초과
- 파일 5개 이상 로드
- 단일 응답 2,000 토큰 초과
- 동일 컨텍스트 3회 반복
```

### `skills/compact-trigger/` ★

```
✅ 압축 가능: 탐색 완료 후, 마일스톤 직후, 실패 접근 포기 후
❌ 압축 금지: 구현 도중, 테스트 RED 상태, 디버깅 중
```

### `skills/python-tdd/`

pytest 기반 TDD 사이클 표준화.

### `skills/iterative-retrieval/`

| 파일 크기 | 전달 방식 |
|---|---|
| < 100줄 | 전체 전달 |
| 100–300줄 | 관련 섹션만 |
| 300줄+ | 인터페이스 시그니처만 |
| 1,000줄+ | 절대 전달 금지 |

---

## 6. Layer 3 — 첨차 Agents

| 에이전트 | 역할 | tools | Write 권한 |
|---|---|---|---|
| `planner` | 설계 전담 (코드 작성 금지) | Read, Glob, Grep | ❌ |
| `tdd-guide` | TDD 강제 실행 | Read, Write, Edit, Bash | ✅ |
| `python-reviewer` | 검토 전담 (수정 금지) | Read, Bash, Grep | ❌ |
| `context-guardian` | 컨텍스트 관리 | Read, Write, Bash | ❌ (체크포인트만) |

---

## 7. Layer 4 — 공포 완성 Hooks

### 6개 이벤트 훅 (`hooks/hooks.json` + `.claude/settings.local.json`)

| # | 이벤트 | 스크립트 | 역할 |
|---|---|---|---|
| 1 | PreToolUse | `pre-edit-guard.js` | 결구 게이트 — TDD 확인 |
| 2 | PostToolUse | `context-watch.js` | 주두 게이트 — 컨텍스트 감시 |
| 3 | PostToolUse | `lean-detector.js` | 안쏠림 — 복잡도 선제 감지 |
| 4 | PostToolUse | `test-result-tracker.js` | 첨차 게이트 — pytest 추적 |
| 5 | SessionStart | `session-start.js` | 그랭이질 + 체크포인트 복원 |
| 6 | Stop | `session-end.js` | 체크포인트 자동 저장 |

> 훅은 `hooks/hooks.json`(참고용 템플릿)과 `.claude/settings.local.json`(실제 실행) 양쪽에 등록됩니다.

### `lean-detector.js` ★ — 안쏠림 신호 가중치

| 신호 | 가중치 | 감지 조건 |
|---|---|---|
| 다중 파일 작업 | 2 | fileLoadsCount ≥ 3 |
| 복잡도 키워드 | 2 | refactor, 아키텍처 등 (tool_input에서만) |
| 반복 오류 | 3 | danger/critical 경고 2회+ |
| 대형 파일 로드 | 2 | Read + 출력 300줄+ |
| 대용량 출력 | 1 | 응답 3,000자+ (대형 파일 로드와 중복 시 제외) |

가중치 합 ≥ 3 AND 컨텍스트 ≥ 30% → 안전 모드 발동. 10턴 쿨다운.

---

## 8. 전체 파일 목록

### 현재 완성 (23개)

```
├── CLAUDE.md
├── README.md                              (v2.2)
│
├── rules/                                 Layer 1: 결구
│   ├── common/
│   │   ├── context-budget.md              ★
│   │   ├── tdd.md
│   │   └── git.md
│   └── python/
│       ├── style.md
│       └── testing.md
│
├── skills/                                Layer 2: 주두
│   ├── context-sentinel/SKILL.md          ★
│   ├── compact-trigger/SKILL.md           ★
│   ├── python-tdd/SKILL.md
│   └── iterative-retrieval/SKILL.md
│
├── agents/                                Layer 3: 첨차
│   ├── planner.md
│   ├── tdd-guide.md
│   ├── python-reviewer.md
│   └── context-guardian.md               ★
│
└── hooks/                                 Layer 4: 공포 완성
    ├── hooks.json                         ★
    └── scripts/
        ├── state-utils.js
        ├── context-watch.js               ★
        ├── lean-detector.js               ★
        ├── session-start.js               ★
        ├── session-end.js
        ├── pre-edit-guard.js
        └── test-result-tracker.js
```

### 로드맵 (미구현)

```
Layer 0:  hooks/scripts/foundation-check.js, isolation-guard.js
Layer 2:  skills/context-shape/, skills/leverage-context/, skills/agent-handoff/
Layer 3:  agents/spec-validator.md, agents/bridge-agent.md
Infra:    hooks/scripts/hooks-logger.js
          .gongpo/profiles/*.json
```

---

## 9. 디버깅 기록

### v2.0 → v2.1 (디버깅 1라운드 — 버그 4개 수정)

**Bug 1** — `context-watch.js`: `_reductionPct` 기본값 누락 → `state-utils.js` DEFAULT_STATE에 추가

**Bug 2** — `lean-detector.js`: 훅 실행 순서 의존성 → hooks.json에서 context-watch(2번)가 lean-detector(3번)보다 먼저 등록, `?? 0` 방어 코드 추가

**Bug 3** — `session-start.js`: TOCTOU race condition → statSync를 try-catch로 래핑

**Bug 4** — `context-watch.js`: `warningHistory` 무한 증가 → 상한 50개 적용, 초과 시 오래된 항목 자동 제거

### v2.1 → v2.2 (디버깅 2라운드 — 버그 5개 수정)

**Bug A1** — `lean-detector.js`: 쿨다운 즉시 발동 오류
- 원인: `lastLeanTurn`과 `turnCount` 모두 기본값 0 → `0 - 0 = 0 < 10` → 세션 1턴부터 영구 쿨다운
- 수정: `if (lastLean === 0) return false` 추가 — 한 번도 발동하지 않은 상태 구분

**Bug A2** — `lean-detector.js`: 복잡도 키워드 오탐
- 원인: `JSON.stringify(event)` 검색 시 `tool_response` 파일 내용까지 포함 → 파일에 "refactor" 단어만 있어도 발동
- 수정: `JSON.stringify(event.tool_input ?? "")` 으로 변경 — 도구 입력만 검사

**Bug B** — `lean-detector.js`: 신호 4·5 이중 계산
- 원인: 300줄 이상 파일 Read 시 신호 4(`largeFileLoad`, 가중치 2)와 신호 5(`largeOutput`, 가중치 1)가 동시 발동 → 합산 가중치 3이 즉시 임계값 도달
- 수정: `largeFileLoad` 발동 시 `largeOutput` 건너뜀 — 중복 계산 방지

**Bug C** — `context-watch.js`: `warningHistory` 삭제 방식 오류
- 원인: `splice(0, 10)` — 50개 초과 시 10개 삭제 → 41개 남김 → 다시 51개까지 증가. 과거 danger 항목이 삭제되면 `lean-detector`의 `repeatedErrors` 신호(가중치 3)가 갑자기 소멸
- 수정: `state.warningHistory = state.warningHistory.slice(-50)` — 항상 최신 50개만 유지

**Bug D** — `state-utils.js`: 상태 파일 손상 시 무음 초기화
- 원인: `fs.readFileSync`와 `JSON.parse`를 같은 `catch (_) {}`로 처리 → JSON 손상 시 경고 없이 전체 상태 리셋
- 수정: fs 오류와 JSON 오류를 별도 `try-catch`로 분리, 각각 `stderr` 경고 출력

---

## 10. 최적화 로드맵

### Sprint 6
- **소로 캐시**: PostToolUse당 state.json I/O 6회 → 1회 (83% 감소)
- **배흘림 컨텍스트**: 고정 800토큰/턴 추정 → 세션 형상 기반 동적 추정

### Sprint 7
- **관찰성 로그**: `.gongpo/hooks.log` 훅 발동 이력
- **외부 프로파일**: `.gongpo/profiles/*.json` — 코드 수정 없이 스택 추가
- **Layer 0 Foundation**: 판축(환경 검증) + 기단(격리) 구현

---

## 11. 설치 및 워크플로우

### 설치 (3분)

```bash
git clone https://github.com/Fullcharge13/Modular-Interlocking
cd Modular-Interlocking

cp -r rules/common ~/.claude/rules/
cp -r rules/python ~/.claude/rules/
cp -r skills/* ~/.claude/skills/
cp agents/*.md ~/.claude/agents/
cp hooks/scripts/*.js ~/.claude/hooks/scripts/

mkdir -p your-project/.gongpo/checkpoints
echo ".gongpo/" >> .gitignore
```

> `.claude/settings.local.json`의 `hooks` 배열을 자신의 settings.local.json에 병합하세요.

### 일상 워크플로우

```
/plan "기능 설명"  →  planner: 설계 문서 + Program.md
승인               →  tdd-guide: RED → GREEN → REFACTOR
완성               →  python-reviewer: mypy + ruff + bandit
```

컨텍스트 경고 대응:

```
🔵 안쏠림 (복잡도 감지): 태스크 분해, iterative-retrieval 적용
🟡 Level 1 (40%+):       파일 로드 자제, 계속 작업
🟠 Level 2 (50%+):       compact-trigger → /compact
🔴 Level 3 (65%+):       자동 체크포인트 → 압축 → 복원
⛔ 차단 (80%+):           압축 완료 전까지 신규 작업 금지
```

---

## 12. 버전 히스토리

| 버전 | 주요 내용 | 파일 수 |
|---|---|---|
| v1.0 | 기본 4층 구조 완성 | 20개 |
| v2.0 | 귀솟음·안쏠림·그랭이질 적용, 5층 구조 | 22개 |
| v2.1 | Bug 1-4 수정, 폴더 구조 정리, lean-detector.js 신규 추가 | 23개 |
| v2.2 | Bug A1·A2·B·C·D 수정 (쿨다운, 오탐, 이중계산, splice, 무음리셋) | 23개 |
| v3.0 | Sprint 6 예정: 소로 캐시 + 배흘림 | ~25개 |

---

*공포(栱包) — 층층이 맞물려 하중을 분산, 못 없는 결합*
*Claude Code + Python 개발 특화 에이전트 하네스*

---
---

# Gongpo (栱包) Agent Harness — Full Technical Specification v2.2

> **"Bearing tons of weight without a single nail"**
>
> A Python development performance system that transplants the structural mechanics
> of Korean traditional architecture into Claude Code agent workflows.
>
> Repo: [Modular-Interlocking](https://github.com/Fullcharge13/Modular-Interlocking)
> Version: v2.2 (2 full debugging rounds complete — 9 bugs fixed)

---

## Table of Contents

1. [Architecture Principle Mapping](#1-architecture-principle-mapping)
2. [5-Layer System Structure](#2-5-layer-system-structure)
3. [Layer 0 — Foundation](#3-layer-0--foundation)
4. [Layer 1 — Rules (결구)](#4-layer-1--rules-)
5. [Layer 2 — Skills (주두)](#5-layer-2--skills-)
6. [Layer 3 — Agents (첨차)](#6-layer-3--agents-)
7. [Layer 4 — Hooks (공포)](#7-layer-4--hooks-)
8. [Full File List](#8-full-file-list)
9. [Bug Fix Log](#9-bug-fix-log)
10. [Optimization Roadmap](#10-optimization-roadmap)
11. [Installation & Workflow](#11-installation--workflow)
12. [Version History](#12-version-history)

---

## 1. Architecture Principle Mapping

### 1.1 Foundation Techniques → Harness Foundation Layer (Layer 0)

| Technique | Structural Role | Harness Application | Status |
|---|---|---|---|
| **Panjuk (板築)** | Compact layers to reach bedrock strength | Environment validation gate — Node.js/Python versions, permissions, deps | Roadmap |
| **Gidan (基壇)** | Isolate from ground, block moisture/erosion | External MCP/API isolation — contamination blocking | Roadmap |
| **Graengijil** | Fit column base precisely to natural stone contours | Project profile auto-detection (session-start.js) | ✅ Sprint 5 |
| **Ground Mix** | Optimal gravel/stone/earth ratio | Language/framework optimal combination auto-detection | Roadmap |

### 1.2 Bracket Set Members → Agent Layers

| Member | Structural Role | Harness Application | Status |
|---|---|---|---|
| **Judu (柱頭)** | Receives upper load, expands contact area | Skills layer — minimum context distribution | ✅ Sprint 2 |
| **Cheomcha (檐遮)** | Horizontal member distributing load sideways | Agents layer — parallel isolated execution | ✅ Sprint 3 |
| **Salmi** | Projecting member supporting eaves inward/outward | Agent extension bridge (cross-domain connector) | Roadmap |
| **Soro** | Small block transferring load between members | agent-handoff standard object | Roadmap |

### 1.3 Advanced Structural Techniques → Hook Layer

| Technique | Structural Principle | Harness Application | Status |
|---|---|---|---|
| **Gwisoseum** | Column height increases toward corners | Adaptive thresholds — caution auto-lowers as turns increase | ✅ Sprint 5 |
| **Ansollim** | Column tops pre-tilted inward to resist external forces | Failure Lean — pre-emptive safe mode on complexity signals | ✅ Sprint 5 |
| **Baeheullim** | Column widened at mid-height to resist buckling | Context Shape — concentrate core context at mid-session | Roadmap |
| **Dapo Style** | Additional bracket sets placed between columns | Inter-agent auxiliary layer | Roadmap |
| **Haang** | Diagonal member using lever principle | Leverage Context — minimize context via interface anchors | Roadmap |

---

## 2. 5-Layer System Structure

```
Human Intent (roof load)
        │
        ▼
Layer 4: Hooks      (Gongpo)    — event-driven inter-layer automation
        │
        ▼
Layer 3: Agents     (Cheomcha)  — isolated execution, single responsibility, failure isolation
        │
        ▼
Layer 2: Skills     (Judu)      — domain knowledge distribution, minimal context
        │
        ▼
Layer 1: Rules      (Gyeolgu)   — immutable base rules, no reinterpretation
        │
        ▼
Layer 0: Foundation (Jiban)     — environment validation, isolation, adaptive base
        │
        ▼
Claude Code Runtime (column)
```

---

## 3. Layer 0 — Foundation

**Panjuk — Environment Validation Gate** (Roadmap)

```
Validation sequence:
1. Node.js ≥ 18
2. Python ≥ 3.11
3. .gongpo/ directory write permission
4. hooks/scripts/ execute permission
5. pytest installed
```

**Gidan — External Dependency Isolation** (Roadmap)

```
Isolation targets:
- Unstable external MCP servers
- Runtime environment variable changes
- Filesystem state (snapshot on session start, diff on exit)
```

**Graengijil — Project Profile Auto-Detection** ✅ (implemented in session-start.js)

---

## 4. Layer 1 — Rules (결구)

### `rules/common/context-budget.md` ★

| Threshold | Status | Action |
|---|---|---|
| 0–40% | 🟢 Normal | Free work |
| 40–50% | 🟡 Caution | Limit new file loads |
| 50–65% | 🟠 Warning | Run compact-trigger |
| 65–80% | 🔴 Danger | Checkpoint then compact |
| 80%+ | ⛔ Stop | Immediate compact, block new tasks |

### `rules/common/tdd.md`

Iron law of TDD. RED → GREEN → REFACTOR, no exceptions.

### `rules/common/git.md`

Branch isolation + TDD commit rhythm.

### `rules/python/style.md` + `rules/python/testing.md`

Type hints required, functions ≤ 30 lines, Given-When-Then structure, coverage ≥ 80%.

---

## 5. Layer 2 — Skills (주두)

### `skills/context-sentinel/` ★

```
Activation conditions:
- Context reaches 40%
- Conversation exceeds 15 turns
- 5+ files loaded
- Single response exceeds 2,000 tokens
- Same context repeated 3 times
```

### `skills/compact-trigger/` ★

```
✅ Safe to compact: after exploration, after milestone, after abandoning failed approach
❌ Never compact: mid-implementation, test RED state, during active debugging
```

### `skills/python-tdd/`

Standardizes pytest-based TDD cycles.

### `skills/iterative-retrieval/`

| File size | Delivery mode |
|---|---|
| < 100 lines | Full file |
| 100–300 lines | Relevant sections only |
| 300+ lines | Interface signatures only |
| 1,000+ lines | Never pass directly |

---

## 6. Layer 3 — Agents (첨차)

| Agent | Role | Tools | Write Permission |
|---|---|---|---|
| `planner` | Design only (no code writing) | Read, Glob, Grep | ❌ |
| `tdd-guide` | Enforces TDD execution | Read, Write, Edit, Bash | ✅ |
| `python-reviewer` | Review only (no modifications) | Read, Bash, Grep | ❌ |
| `context-guardian` | Context management | Read, Write, Bash | ❌ (checkpoints only) |

---

## 7. Layer 4 — Hooks (공포)

### 6 Event Hooks (`hooks/hooks.json` + `.claude/settings.local.json`)

| # | Event | Script | Role |
|---|---|---|---|
| 1 | PreToolUse | `pre-edit-guard.js` | Gyeolgu gate — TDD verification |
| 2 | PostToolUse | `context-watch.js` | Judu gate — context monitoring |
| 3 | PostToolUse | `lean-detector.js` | Ansollim — pre-emptive complexity detection |
| 4 | PostToolUse | `test-result-tracker.js` | Cheomcha gate — pytest tracking |
| 5 | SessionStart | `session-start.js` | Graengijil + checkpoint restore |
| 6 | Stop | `session-end.js` | Auto checkpoint save |

> Hooks are registered in both `hooks/hooks.json` (reference template) and `.claude/settings.local.json` (active execution).

### `lean-detector.js` ★ — Ansollim Signal Weights

| Signal | Weight | Detection Condition |
|---|---|---|
| Multi-file work | 2 | fileLoadsCount ≥ 3 |
| Complexity keywords | 2 | refactor, architecture, etc. (tool_input only) |
| Repeated errors | 3 | danger/critical warnings ≥ 2 |
| Large file load | 2 | Read tool + output ≥ 300 lines |
| Large output | 1 | Response ≥ 3,000 chars (skipped if large file load triggered) |

Weight sum ≥ 3 AND context ≥ 30% → safe mode activated. 10-turn cooldown.

---

## 8. Full File List

### Currently Complete (23 files)

```
├── CLAUDE.md
├── README.md                              (v2.2)
│
├── rules/                                 Layer 1: Gyeolgu
│   ├── common/
│   │   ├── context-budget.md              ★
│   │   ├── tdd.md
│   │   └── git.md
│   └── python/
│       ├── style.md
│       └── testing.md
│
├── skills/                                Layer 2: Judu
│   ├── context-sentinel/SKILL.md          ★
│   ├── compact-trigger/SKILL.md           ★
│   ├── python-tdd/SKILL.md
│   └── iterative-retrieval/SKILL.md
│
├── agents/                                Layer 3: Cheomcha
│   ├── planner.md
│   ├── tdd-guide.md
│   ├── python-reviewer.md
│   └── context-guardian.md               ★
│
└── hooks/                                 Layer 4: Gongpo
    ├── hooks.json                         ★
    └── scripts/
        ├── state-utils.js
        ├── context-watch.js               ★
        ├── lean-detector.js               ★
        ├── session-start.js               ★
        ├── session-end.js
        ├── pre-edit-guard.js
        └── test-result-tracker.js
```

### Roadmap (not yet implemented)

```
Layer 0:  hooks/scripts/foundation-check.js, isolation-guard.js
Layer 2:  skills/context-shape/, skills/leverage-context/, skills/agent-handoff/
Layer 3:  agents/spec-validator.md, agents/bridge-agent.md
Infra:    hooks/scripts/hooks-logger.js
          .gongpo/profiles/*.json
```

---

## 9. Bug Fix Log

### v2.0 → v2.1 (Debugging Round 1 — 4 bugs fixed)

**Bug 1** — `context-watch.js`: `_reductionPct` missing from DEFAULT_STATE → added to `state-utils.js`

**Bug 2** — `lean-detector.js`: hook execution order dependency → context-watch (slot 2) registered before lean-detector (slot 3) in hooks.json, added `?? 0` guards

**Bug 3** — `session-start.js`: TOCTOU race condition → wrapped `statSync` in try-catch

**Bug 4** — `context-watch.js`: `warningHistory` growing without bound → capped at 50 entries, auto-purge on overflow

### v2.1 → v2.2 (Debugging Round 2 — 5 bugs fixed)

**Bug A1** — `lean-detector.js`: cooldown active from turn 1
- Cause: `lastLeanTurn` and `turnCount` both default to 0 → `0 - 0 = 0 < 10` → detector permanently locked on session start
- Fix: Added `if (lastLean === 0) return false` to distinguish "never fired" from "recently fired"

**Bug A2** — `lean-detector.js`: keyword false positives from file contents
- Cause: `JSON.stringify(event)` included `tool_response` file contents → a file containing the word "refactor" triggered the complexity signal
- Fix: Changed to `JSON.stringify(event.tool_input ?? "")` — only inspect tool input, never response body

**Bug B** — `lean-detector.js`: signals 4 and 5 double-counted
- Cause: Reading a 300+ line file triggers both signal 4 (`largeFileLoad`, weight 2) and signal 5 (`largeOutput`, weight 1) simultaneously → combined weight 3 hits threshold instantly on any large file read
- Fix: Signal 5 (`largeOutput`) is skipped when signal 4 (`largeFileLoad`) already fired

**Bug C** — `context-watch.js`: `warningHistory` splice oscillation
- Cause: `splice(0, 10)` removes 10 oldest entries when count exceeds 50, leaving 41 — list grows back to 51 each time. When old `danger` entries are spliced out, `lean-detector`'s `repeatedErrors` signal (weight 3) silently disappears
- Fix: `state.warningHistory = state.warningHistory.slice(-50)` — always retain the most recent 50 entries

**Bug D** — `state-utils.js`: silent state reset on corrupted JSON
- Cause: `fs.readFileSync` and `JSON.parse` shared a single `catch (_) {}` block → a corrupted state file caused a silent full reset with no user warning
- Fix: Separated into two distinct try-catch blocks; each writes a descriptive warning to stderr

---

## 10. Optimization Roadmap

### Sprint 6
- **Soro Cache**: Reduce state.json I/O from 6 writes/PostToolUse to 1 (83% reduction)
- **Baeheullim Context**: Replace fixed 800 token/turn estimate with session-shape dynamic estimation

### Sprint 7
- **Observability Log**: `.gongpo/hooks.log` hook activation history
- **External Profiles**: `.gongpo/profiles/*.json` — add new stacks without code changes
- **Layer 0 Foundation**: Implement Panjuk (env validation) + Gidan (isolation)

---

## 11. Installation & Workflow

### Installation (3 minutes)

```bash
git clone https://github.com/Fullcharge13/Modular-Interlocking
cd Modular-Interlocking

cp -r rules/common ~/.claude/rules/
cp -r rules/python ~/.claude/rules/
cp -r skills/* ~/.claude/skills/
cp agents/*.md ~/.claude/agents/
cp hooks/scripts/*.js ~/.claude/hooks/scripts/

mkdir -p your-project/.gongpo/checkpoints
echo ".gongpo/" >> .gitignore
```

> Merge the `hooks` array from `.claude/settings.local.json` into your own settings.local.json.

### Daily Workflow

```
/plan "feature description"  →  planner: design doc + Program.md
approve                       →  tdd-guide: RED → GREEN → REFACTOR
complete                      →  python-reviewer: mypy + ruff + bandit
```

Context warning response:

```
🔵 Ansollim (complexity detected): decompose task, apply iterative-retrieval
🟡 Level 1 (40%+):  limit file loads, continue work
🟠 Level 2 (50%+):  compact-trigger → /compact
🔴 Level 3 (65%+):  auto-checkpoint → compact → restore
⛔ Block (80%+):     no new tasks until compact completes
```

---

## 12. Version History

| Version | Key Changes | Files |
|---|---|---|
| v1.0 | Basic 4-layer structure | 20 |
| v2.0 | Gwisoseum, Ansollim, Graengijil, 5-layer structure | 22 |
| v2.1 | Bugs 1-4 fixed, folder restructure, lean-detector.js added | 23 |
| v2.2 | Bugs A1·A2·B·C·D fixed (cooldown, false-positive, double-count, splice, silent-reset) | 23 |
| v3.0 | Sprint 6 planned: Soro cache + Baeheullim | ~25 |

---

*Gongpo (栱包) — interlocking layers distribute the load, joined without a single nail*
*Agent harness for Claude Code + Python development*
*Repo: https://github.com/Fullcharge13/Modular-Interlocking*
