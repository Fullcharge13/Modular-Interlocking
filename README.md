# 공포(栱包) 에이전트 하네스 / Gongpo Agent Harness

**언어 선택 / Language:**  [한국어](#한국어) | [English](#english)

---

<a name="한국어"></a>
# 한국어

> **"못 하나 없이 수십 톤을 버티는 구조"**
>
> 한국 전통 목조건축의 하중 분산 원리를 Claude Code 에이전트 워크플로우에 적용한
> Python 개발 특화 성능 최적화 시스템.
>
> 핵심 문제: 컨텍스트 폭발 → 토큰 낭비 → 품질 저하  
> 핵심 해법: 4층 계층 구조로 복잡도 하중을 분산

---

## 설계 철학

공포는 기둥 위에 지붕 하중을 분산시키는 4단계 목조 구조물입니다.
각 단계는 이전 단계의 문제를 해결하면서 쌓여 올라갑니다.

| 공포 구조 | 해결한 문제 | 에이전트 하네스 대응 |
|---|---|---|
| **결구** | 기둥 위 나무가 미끄러짐 | Rules — 불변 규칙으로 에이전트 고정 |
| **주두** | 기둥을 깎으면 부러짐 | Skills — 도메인 지식을 분산하여 과부하 방지 |
| **첨차** | 지붕이 한쪽으로 처짐 | Agents — 독립 실행으로 실패 격리 |
| **공포** | 전체 구조의 완성 | Hooks — 이벤트 기반 층간 자동 연결 |

---

## 전체 구조

```
gongpo/
├── CLAUDE.md                          # 기둥 — 세션 진입점, 4층 원칙 선언
│
├── rules/                             # Layer 1: 결구 (불변 기반)
│   ├── common/
│   │   ├── context-budget.md          # ★ 컨텍스트 예산 법칙 (5단계 임계값)
│   │   ├── tdd.md                     # TDD 철의 법칙 (RED→GREEN→REFACTOR)
│   │   └── git.md                     # 브랜치 격리 + 커밋 컨벤션
│   └── python/
│       ├── style.md                   # 타입 힌트, 단일 책임, 금지 패턴
│       └── testing.md                 # pytest 표준 (Given-When-Then)
│
├── skills/                            # Layer 2: 주두 (복잡도 분산)
│   ├── context-sentinel/
│   │   └── SKILL.md                   # ★ 실시간 컨텍스트 상태 감시
│   ├── compact-trigger/
│   │   └── SKILL.md                   # ★ 압축 시점 능동 결정 + 체크포인트
│   ├── python-tdd/
│   │   └── SKILL.md                   # Python TDD 사이클 표준화
│   └── iterative-retrieval/
│       └── SKILL.md                   # 서브에이전트 3단계 점진적 컨텍스트 전달
│
├── agents/                            # Layer 3: 첨차 (병렬 격리)
│   ├── planner.md                     # 설계 전담 (코드 작성 금지)
│   ├── tdd-guide.md                   # TDD 사이클 강제 실행
│   ├── python-reviewer.md             # 코드 품질 검토 (수정 금지)
│   └── context-guardian.md            # ★ 컨텍스트 능동 관리 (3단계 개입)
│
└── hooks/                             # Layer 4: 공포 완성 (이벤트 연결)
    ├── hooks.json                     # ★ 5개 이벤트 훅 설정
    └── scripts/
        ├── context-watch.js           # ★ PostToolUse: 실시간 컨텍스트 감시
        ├── pre-edit-guard.js          # PreToolUse: Python 수정 전 TDD 확인
        ├── test-result-tracker.js     # PostToolUse(Bash): pytest 결과 추적
        ├── session-start.js           # SessionStart: 체크포인트 복원
        └── session-end.js             # Stop: 체크포인트 자동 저장
```

★ = 이 시스템의 핵심 신규 컴포넌트

---

## Layer 1: Rules (결구)

**원칙**: 모든 에이전트가 재해석 없이 따르는 불변 규칙.  
공포의 결구처럼, 홈을 파서 나무가 미끄러지지 않게 고정한다.

### `rules/common/context-budget.md`

```
🟢 0–40%   → 정상: 자유롭게 작업
🟡 40–50%  → 주의: 불필요한 파일 로드 중단
🟠 50–65%  → 경고: compact-trigger 실행
🔴 65–80%  → 위험: 체크포인트 저장 후 압축
⛔ 80%+    → 중단: 즉시 압축, 새 작업 금지
```

서브에이전트 전달 금지 항목:
- ❌ 전체 대화 히스토리
- ❌ 완료된 태스크의 세부 내용
- ❌ 관련 없는 파일 내용
- ✅ 현재 태스크 Spec + Interface만

### `rules/common/tdd.md`

```
RED   → 실패하는 테스트 먼저. 올바른 이유로 실패해야 한다.
GREEN → 가장 단순한 코드로 통과. 추가 기능 금지.
REFACTOR → 동작 변경 없이 정리. 매 변경 후 전체 스위트 실행.
```

### `rules/python/`

`style.md`: 타입 힌트 필수, 함수 30줄 이하, 마법 숫자 금지.  
`testing.md`: Given-When-Then 구조, fixture 패턴, 커버리지 80%+ 기준.

---

## Layer 2: Skills (주두)

**원칙**: 도메인 지식을 skill 단위로 분산하여 에이전트가 최소 컨텍스트만 필요로 하게 한다.

### `skills/context-sentinel/`

5개 발동 조건:
```
- 컨텍스트 40% 도달
- 대화 15턴 초과
- 파일 5개 이상 로드
- 단일 응답 2,000 토큰 초과
- 동일 컨텍스트 3회 이상 반복
```

### `skills/compact-trigger/`

```
✅ 압축 가능: 연구 완료 후, 마일스톤 직후, 실패 접근 포기 후
❌ 압축 금지: 구현 도중, 테스트 RED 상태, 디버깅 중
```

### `skills/iterative-retrieval/`

```
1단계: Spec만 (항상)
2단계: 에이전트 요청 시 추가 (선택)
3단계: 결과 요약으로 반환 (전체 과정 아님)
```

파일 크기별 전달 방식: 100줄 이하 전체 / 300줄+ 섹션만 / 1,000줄+ 절대 금지.

---

## Layer 3: Agents (첨차)

**원칙**: 각 에이전트는 단일 역할만 수행하고 독립 실행된다.

| 에이전트 | 역할 | 코드 작성 | 코드 수정 |
|---|---|---|---|
| `planner` | 설계만 | ❌ | ❌ |
| `tdd-guide` | TDD 강제 | ✅ | ✅ |
| `python-reviewer` | 검토만 | ❌ | ❌ |
| `context-guardian` | 컨텍스트 관리 | ❌ | ❌ |

### `agents/context-guardian.md`

```
Level 1 (40–50%): 가이드 — 경고 출력, 파일 로드 자제 권고
Level 2 (50–70%): 압축 실행 — 체크포인트 저장 → /compact → 복원
Level 3 (70%+):   긴급 차단 — 새 작업 즉시 차단 → 강제 압축
```

---

## Layer 4: Hooks (공포 완성)

**원칙**: 각 층은 인접 층만 알면 된다. Hooks가 이벤트 기반으로 층을 연결한다.

| 이벤트 | 스크립트 | 역할 |
|---|---|---|
| PreToolUse (Write/Edit + `.py`) | `pre-edit-guard.js` | 결구 게이트 |
| PostToolUse (Read/Write/Edit/Bash) | `context-watch.js` | 주두 게이트 |
| PostToolUse (Bash) | `test-result-tracker.js` | 첨차 게이트 |
| SessionStart | `session-start.js` | 체크포인트 복원 |
| Stop | `session-end.js` | 체크포인트 저장 |

---

## 설치

```bash
# 1. 레포 루트에 진입점 설치
cp CLAUDE.md ~/your-project/

# 2. Rules
mkdir -p ~/.claude/rules
cp -r rules/common ~/.claude/rules/
cp -r rules/python ~/.claude/rules/

# 3. Skills
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/

# 4. Agents
mkdir -p ~/.claude/agents
cp agents/*.md ~/.claude/agents/

# 5. Hooks
mkdir -p ~/.claude/hooks/scripts
cp hooks/hooks.json ~/.claude/hooks/
cp hooks/scripts/*.js ~/.claude/hooks/scripts/

# 6. 체크포인트 디렉토리 초기화
mkdir -p your-project/.gongpo/checkpoints
echo ".gongpo/" >> .gitignore
```

---

## 일상 워크플로우

### 새 기능 시작
```
1. planner → 설계 문서 + Program.md 생성
2. 승인 후 tdd-guide로 위임
3. RED → GREEN → REFACTOR
4. python-reviewer 최종 검토
5. 머지
```

### 컨텍스트 경고 발생 시
```
🟡 40%+ → 파일 로드 자제, 계속 작업
🟠 50%+ → /compact 실행 시점 결정
🔴 70%+ → context-guardian 자동 개입
⛔ 80%+ → 자동 차단 → 압축 후 재개
```

---

## 향후 확장 방향

| 확장 | 내용 |
|---|---|
| 도메인 skill 추가 | FastAPI, SQLAlchemy, Pydantic 특화 지식 |
| 언어 확장 | TypeScript, Go용 rules 추가 |
| 에이전트 확장 | DB reviewer, API designer 추가 |
| Hook 튜닝 | 임계값을 프로젝트 규모에 맞게 조정 |

---

*공포(栱包) — 층층이 맞물려 하중을 분산, 못 없는 결합*  
*Claude Code + Python 개발 특화 에이전트 하네스*

---
---

<a name="english"></a>
# English

> **"Bearing tons of load without a single nail"**
>
> A Python-focused performance optimization system for Claude Code agent workflows,
> inspired by the load-distribution principles of Korean traditional timber architecture.
>
> Core Problem: Context explosion → Token waste → Quality degradation  
> Core Solution: Distribute complexity load across a 4-layer hierarchy

---

## Design Philosophy

*Gongpo (栱包)* is a 4-tier timber bracket system that distributes roof load above a pillar.
Each tier solves the problem of the tier below it.

| Gongpo Tier | Problem Solved | Agent Harness Equivalent |
|---|---|---|
| **Gyeolgu** | Wood slides off the pillar | Rules — immutable rules that anchor agents |
| **Judu** | Pillar breaks if carved too deep | Skills — distribute domain knowledge to prevent overload |
| **Cheomcha** | Roof sags to one side | Agents — isolated execution to contain failures |
| **Gongpo** | Completes the full structure | Hooks — event-driven interlayer connection |

---

## Project Structure

```
gongpo/
├── CLAUDE.md                          # Pillar — session entry point, 4-layer declaration
│
├── rules/                             # Layer 1: Gyeolgu (immutable foundation)
│   ├── common/
│   │   ├── context-budget.md          # ★ Context budget law (5-level thresholds)
│   │   ├── tdd.md                     # TDD iron law (RED→GREEN→REFACTOR)
│   │   └── git.md                     # Branch isolation + commit conventions
│   └── python/
│       ├── style.md                   # Type hints, single responsibility, forbidden patterns
│       └── testing.md                 # pytest standards (Given-When-Then)
│
├── skills/                            # Layer 2: Judu (complexity distribution)
│   ├── context-sentinel/
│   │   └── SKILL.md                   # ★ Real-time context state monitoring
│   ├── compact-trigger/
│   │   └── SKILL.md                   # ★ Proactive compression decision + checkpoints
│   ├── python-tdd/
│   │   └── SKILL.md                   # Python TDD cycle standardization
│   └── iterative-retrieval/
│       └── SKILL.md                   # 3-stage progressive context delivery to subagents
│
├── agents/                            # Layer 3: Cheomcha (parallel isolation)
│   ├── planner.md                     # Design only (no code writing)
│   ├── tdd-guide.md                   # Enforces TDD cycle
│   ├── python-reviewer.md             # Code quality review (no edits)
│   └── context-guardian.md            # ★ Active context management (3-level intervention)
│
└── hooks/                             # Layer 4: Gongpo (event-driven connection)
    ├── hooks.json                     # ★ 5 event hook configurations
    └── scripts/
        ├── context-watch.js           # ★ PostToolUse: real-time context monitoring
        ├── pre-edit-guard.js          # PreToolUse: TDD check before Python edits
        ├── test-result-tracker.js     # PostToolUse(Bash): pytest result tracking
        ├── session-start.js           # SessionStart: checkpoint restore
        └── session-end.js             # Stop: automatic checkpoint save
```

★ = Key new components of this system

---

## Layer 1: Rules (Gyeolgu)

**Principle**: Immutable rules that all agents follow without reinterpretation.  
Like the notch in a gyeolgu joint, they prevent the wood from slipping.

### `rules/common/context-budget.md`

```
🟢 0–40%   → Normal: work freely
🟡 40–50%  → Caution: stop loading unnecessary files
🟠 50–65%  → Warning: run compact-trigger
🔴 65–80%  → Danger: save checkpoint then compact
⛔ 80%+    → Halt: immediate compaction, no new tasks
```

Do NOT pass to subagents:
- ❌ Full conversation history
- ❌ Details of completed tasks
- ❌ Unrelated file contents
- ✅ Only current task Spec + Interface

### `rules/common/tdd.md`

```
RED      → Write failing test first. It must fail for the right reason.
GREEN    → Pass with the simplest code. No extra features.
REFACTOR → Clean up without changing behavior. Run full suite after every change.
```

### `rules/python/`

`style.md`: Type hints required, functions ≤ 30 lines, no magic numbers.  
`testing.md`: Given-When-Then structure, fixture patterns, ≥ 80% coverage.

---

## Layer 2: Skills (Judu)

**Principle**: Distribute domain knowledge into skill units so agents need only minimal context.

### `skills/context-sentinel/`

5 trigger conditions:
```
- Context reaches 40%
- Conversation exceeds 15 turns
- 5+ files loaded
- Single response exceeds 2,000 tokens
- Same context repeated 3+ times
```

### `skills/compact-trigger/`

```
✅ OK to compact: after research complete, after milestone, after abandoned approach
❌ Never compact: mid-implementation, test in RED state, during active debugging
```

### `skills/iterative-retrieval/`

```
Stage 1: Spec only (always)
Stage 2: Additional context on agent request (optional)
Stage 3: Return result summary only (not the full process)
```

File size delivery rules: ≤ 100 lines → full / 300+ lines → sections only / 1,000+ lines → never.

---

## Layer 3: Agents (Cheomcha)

**Principle**: Each agent has a single role and runs in isolation. One agent failing does not stop others.

| Agent | Role | Write Code | Edit Code |
|---|---|---|---|
| `planner` | Design only | ❌ | ❌ |
| `tdd-guide` | Enforce TDD | ✅ | ✅ |
| `python-reviewer` | Review only | ❌ | ❌ |
| `context-guardian` | Context management | ❌ | ❌ |

**Minimum privilege principle**: `python-reviewer` has no `Write` permission.  
If a reviewer can edit code, the cheomcha separation collapses.

### `agents/context-guardian.md`

```
Level 1 (40–50%): Guide    — print warning, advise against file loads
Level 2 (50–70%): Compact  — save checkpoint → /compact → restore
Level 3 (70%+):   Block    — halt new tasks immediately → force compact
```

Does NOT intervene during TDD RED/GREEN phases (protects the test cycle).

---

## Layer 4: Hooks (Gongpo)

**Principle**: Each layer only needs to know its adjacent layer. Hooks connect layers via events — no nails.

| Event | Script | Role |
|---|---|---|
| PreToolUse (Write/Edit + `.py`) | `pre-edit-guard.js` | Gyeolgu gate |
| PostToolUse (Read/Write/Edit/Bash) | `context-watch.js` | Judu gate |
| PostToolUse (Bash) | `test-result-tracker.js` | Cheomcha gate |
| SessionStart | `session-start.js` | Checkpoint restore |
| Stop | `session-end.js` | Checkpoint save |

### `context-watch.js` — core ★

Token estimation per tool call:
```
perTurn:         800 tokens
perFileLoad:    2,000 tokens
perLargeOutput: 1,500 tokens
maxContext:   200,000 tokens
```

Emits warning banners to stderr at thresholds.  
Returns `continue: false` only at `critical (80%+)` AND outside TDD-protected phases.  
On any error, always returns `continue: true` — hooks never crash the session.

---

## Installation

```bash
# 1. Copy entry point to your project root
cp CLAUDE.md ~/your-project/

# 2. Rules
mkdir -p ~/.claude/rules
cp -r rules/common ~/.claude/rules/
cp -r rules/python ~/.claude/rules/

# 3. Skills
mkdir -p ~/.claude/skills
cp -r skills/* ~/.claude/skills/

# 4. Agents
mkdir -p ~/.claude/agents
cp agents/*.md ~/.claude/agents/

# 5. Hooks
mkdir -p ~/.claude/hooks/scripts
cp hooks/hooks.json ~/.claude/hooks/
cp hooks/scripts/*.js ~/.claude/hooks/scripts/

# 6. Initialize checkpoint directory
mkdir -p your-project/.gongpo/checkpoints
echo ".gongpo/" >> .gitignore
```

---

## Daily Workflow

### Starting a new feature
```
1. planner agent → design doc + Program.md
2. Approve → delegate to tdd-guide
3. RED (test) → GREEN (implement) → REFACTOR (clean)
4. python-reviewer for final review
5. Merge
```

### Fixing a bug
```
1. Write a failing test that reproduces the bug first (tdd-guide)
2. Fix the root cause
3. Confirm full suite passes
```

### When context warnings appear
```
🟡 40%+ → Reduce file loads, continue working
🟠 50%+ → Consult compact-trigger skill → decide /compact timing
🔴 70%+ → context-guardian auto-intervenes → checkpoint + compact
⛔ 80%+ → Auto-blocked → compact then resume
```

---

## Future Expansion

| Direction | Content |
|---|---|
| Domain skills | FastAPI, SQLAlchemy, Pydantic specialization |
| Language expansion | Rules for TypeScript, Go |
| Instinct system | Auto-extract repeated patterns → evolve into skills |
| Agent expansion | DB reviewer, API designer |
| Hook tuning | Adjust thresholds to project scale |

---

*Gongpo (栱包) — interlocking tiers distribute the load, joined without nails*  
*Claude Code agent harness, specialized for Python development*
