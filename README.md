# 공포(栱包) 에이전트 하네스

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

컨텍스트 폭발 방지의 법적 근거.

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

TDD 철의 법칙. "이번 한 번만"은 없다.

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
주두의 넓은 면적처럼, 하중을 사방으로 퍼뜨린다.

### `skills/context-sentinel/`

컨텍스트 상태 감시 전담. 5개 발동 조건:

```
- 컨텍스트 40% 도달
- 대화 15턴 초과
- 파일 5개 이상 로드
- 단일 응답 2,000 토큰 초과
- 동일 컨텍스트 3회 이상 반복
```

감지 즉시 상태 리포트 출력 → `compact-trigger`로 위임.

### `skills/compact-trigger/`

압축 시점 판단 전담. 핵심은 "언제 압축하면 안 되는가":

```
✅ 압축 가능: 연구 완료 후, 마일스톤 직후, 실패 접근 포기 후
❌ 압축 금지: 구현 도중, 테스트 RED 상태, 디버깅 중
```

압축 전 체크포인트 생성 → `/compact` 실행 → 압축 후 20% 이하 확인.

### `skills/python-tdd/`

RED→GREEN→REFACTOR 사이클을 Python pytest 기준으로 표준화.
TDD 사이클 중 컨텍스트 압축 금지 규칙 포함.

### `skills/iterative-retrieval/`

서브에이전트 호출 시 3단계 점진적 컨텍스트 전달:

```
1단계: Spec만 (항상)
2단계: 에이전트 요청 시 추가 (선택)
3단계: 결과 요약으로 반환 (전체 과정 아님)
```

파일 크기별 전달 방식: 100줄 이하 전체 / 300줄+ 섹션만 / 1,000줄+ 절대 금지.

---

## Layer 3: Agents (첨차)

**원칙**: 각 에이전트는 단일 역할만 수행하고 독립 실행된다.
한 에이전트가 실패해도 다른 에이전트는 계속 진행한다.
첨차처럼 하중을 양방향으로 나누어 처짐을 방지한다.

### 에이전트 권한 매트릭스

| 에이전트 | 역할 | tools | 코드 작성 | 코드 수정 |
|---|---|---|---|---|
| `planner` | 설계만 | Read, Glob, Grep | ❌ | ❌ |
| `tdd-guide` | TDD 강제 | Read, Write, Edit, Bash | ✅ | ✅ |
| `python-reviewer` | 검토만 | Read, Bash, Grep | ❌ | ❌ |
| `context-guardian` | 컨텍스트 관리 | Read, Write, Bash | ❌ | ❌ |

**최소 권한 원칙**: `python-reviewer`는 `Write` 권한이 없다.
검토자가 코드를 수정하면 첨차의 분리가 무너진다.

### `agents/planner.md`

요청 → 설계 문서 + Program.md 생성 → 승인 요청 → tdd-guide에 위임.
승인 전 구현 시작 금지. 컨텍스트 예산: 15,000 토큰.

### `agents/tdd-guide.md`

RED 게이트: 테스트가 올바른 이유로 실패해야 GREEN 진행 허용.
GREEN 게이트: 전체 스위트 통과해야 REFACTOR 진행 허용.
컨텍스트 예산: 20,000 토큰. TDD 사이클 중 압축 금지.

### `agents/python-reviewer.md`

4가지 자동 검사: `mypy` / `ruff` / `bandit` / `pytest --cov`.
3단계 심각도: Critical (머지 차단) / Important (수정 권장) / Suggestion (선택).
300줄 초과 파일은 NEEDS_CONTEXT 반환 (파일 분할 권장).

### `agents/context-guardian.md`

3단계 개입 수준:

```
Level 1 (40–50%): 가이드 — 경고 출력, 파일 로드 자제 권고
Level 2 (50–70%): 압축 실행 — 체크포인트 저장 → /compact → 복원
Level 3 (70%+):   긴급 차단 — 새 작업 즉시 차단 → 강제 압축
```

TDD RED/GREEN 단계에서는 개입하지 않는다 (테스트 사이클 보호).

---

## Layer 4: Hooks (공포 완성)

**원칙**: 각 층은 인접 층만 알면 된다. 전체를 알 필요 없다.
Hooks가 이벤트 기반으로 층을 연결한다. 못 없는 결합.

### `hooks/hooks.json` — 5개 이벤트 훅

| 이벤트 | 매처 | 스크립트 | 역할 |
|---|---|---|---|
| PreToolUse | Write/Edit + `.py$` | `pre-edit-guard.js` | 결구 게이트 |
| PostToolUse | Read/Write/Edit/Bash | `context-watch.js` | 주두 게이트 |
| PostToolUse | Bash | `test-result-tracker.js` | 첨차 게이트 |
| SessionStart | — | `session-start.js` | 체크포인트 복원 |
| Stop | — | `session-end.js` | 체크포인트 저장 |

### `hooks/scripts/context-watch.js` ★ 핵심

매 도구 사용 후 컨텍스트 추정 사용량 계산:

```
perTurn:         800 토큰
perFileLoad:    2,000 토큰
perLargeOutput: 1,500 토큰
maxContext:   200,000 토큰
```

임계값 도달 시 stderr로 경고 배너 출력.
`critical(80%+)` + TDD 비보호 단계일 때만 `continue: false` 반환.
오류 발생 시 항상 `continue: true` — 훅이 세션을 중단하지 않는다.

### `hooks/scripts/pre-edit-guard.js`

Python 파일 수정 전:
- 신규 파일 → 테스트 먼저 작성 안내
- 기존 파일 → 대응 테스트 파일 존재 확인
- 경고 후 진행 허용 (완전 차단은 UX를 해침)

### `hooks/scripts/test-result-tracker.js`

Bash 실행 후 pytest 출력 분석:
- `FAILED` → state에 `currentTddPhase: "RED"` 기록
- `passed` + 실패 없음 → `currentTddPhase: "GREEN"` 기록
- context-guardian의 TDD 보호 판단 근거로 사용

### `hooks/scripts/session-start.js` / `session-end.js`

세션 시작: 컨텍스트 상태 초기화 + `.gongpo/checkpoints/latest.md` 로드 + 복원 배너 출력.
세션 종료: 타임스탬프 기반 체크포인트 저장 + `latest.md` 갱신 + 세션 요약 출력.

---

## 이벤트 흐름 (공포의 작동 방식)

```
세션 시작
    │
    └─ SessionStart → session-start.js
           체크포인트 복원, 컨텍스트 상태 초기화
           │
           ▼
    [작업 중 — 매 도구 호출마다]
           │
    ┌──────┴──────────────────────────────────┐
    │                                         │
    ▼                                         ▼
PreToolUse                              PostToolUse
(Write/Edit + .py)                  (Read/Write/Edit/Bash)
    │                                         │
pre-edit-guard.js                   context-watch.js
TDD 준수 확인                        컨텍스트 감시
    │                               + test-result-tracker.js
    │                                 pytest 결과 추적
    └──────────────┬──────────────────────────┘
                   │
    컨텍스트 50%+ 감지
                   │
                   ▼
         context-guardian 개입
         Level 1 / 2 / 3 결정
                   │
                   ▼
              /compact 실행
              체크포인트 저장
                   │
    세션 종료
    │
    └─ Stop → session-end.js
           체크포인트 저장
           세션 요약 출력
```

---

## 설치

```bash
# 1. 레포 루트에 진입점 설치
cp CLAUDE.md ~/your-project/

# 2. Rules — Claude Code 글로벌 규칙
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
1. planner 에이전트 → 설계 문서 + Program.md 생성
2. 승인 후 tdd-guide로 위임
3. RED(테스트) → GREEN(구현) → REFACTOR(정리)
4. python-reviewer로 최종 검토
5. 머지
```

### 버그 수정

```
1. 버그를 재현하는 실패 테스트 먼저 작성 (tdd-guide)
2. 루트 원인 수정
3. 전체 스위트 통과 확인
```

### 컨텍스트 경고 발생 시

```
🟡 40%+ → 파일 로드 자제, 계속 작업
🟠 50%+ → compact-trigger skill 참조 → /compact 실행 시점 결정
🔴 70%+ → context-guardian이 자동 개입 → 체크포인트 저장 → 압축
⛔ 80%+ → 자동 차단 → 압축 후 재개
```

---

## 파일 목록 (20개)

```
CLAUDE.md
rules/common/context-budget.md
rules/common/tdd.md
rules/common/git.md
rules/python/style.md
rules/python/testing.md
skills/context-sentinel/SKILL.md
skills/compact-trigger/SKILL.md
skills/python-tdd/SKILL.md
skills/iterative-retrieval/SKILL.md
agents/planner.md
agents/tdd-guide.md
agents/python-reviewer.md
agents/context-guardian.md
hooks/hooks.json
hooks/scripts/context-watch.js
hooks/scripts/pre-edit-guard.js
hooks/scripts/test-result-tracker.js
hooks/scripts/session-start.js
hooks/scripts/session-end.js
```

---

## 향후 확장 방향

이 시스템은 뼈대입니다. 실제 사용하면서 쌓아갈 수 있는 방향들:

| 확장 | 내용 |
|---|---|
| 도메인 skill 추가 | FastAPI, SQLAlchemy, Pydantic 등 프로젝트 특화 지식 |
| 언어 확장 | TypeScript, Go용 rules 추가 |
| Instinct 시스템 | 반복 패턴 자동 추출 → skill로 진화 |
| 에이전트 확장 | DB reviewer, API designer 추가 |
| Hook 튜닝 | 임계값을 프로젝트 규모에 맞게 조정 |

---

*공포(栱包) — 층층이 맞물려 하중을 분산, 못 없는 결합*
*Claude Code + Python 개발 특화 에이전트 하네스*
