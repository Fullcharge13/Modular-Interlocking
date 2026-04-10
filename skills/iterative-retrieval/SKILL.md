# Iterative Retrieval (점진적 컨텍스트 전달)

> **주두 원칙**: 서브에이전트에게 전체 지식을 한번에 전달하는 것은
> 주두 없이 기둥 위에 지붕을 올리는 것이다.
> 필요한 만큼만, 그때그때 전달한다.

---

## 역할

서브에이전트 호출 시 컨텍스트를 점진적으로 전달하여,
각 에이전트 호출이 최소 토큰으로 최대 효과를 내도록 한다.

---

## 핵심 원칙: 3단계 전달

```
1단계: Spec만 (항상)
   → 에이전트가 태스크를 이해하기 위한 최소 정보

2단계: 필요 시 추가 (선택)
   → 에이전트가 "더 필요하다"고 요청할 때만

3단계: 결과 요약 (반환 시)
   → 전체 과정이 아닌 결과와 결정사항만 반환
```

---

## 서브에이전트 호출 템플릿

### 기본 호출 (1단계만)

```markdown
## 태스크 Spec

**목표**: [한 문장으로 명확하게]
**입력**: [타입과 예시]
**출력**: [타입과 예시]
**제약**: [금지 사항이나 반드시 지켜야 할 것]

## 인터페이스

```python
def function_name(param: Type) -> ReturnType:
    """docstring"""
```

## 완료 기준

- [ ] [검증 가능한 기준 1]
- [ ] [검증 가능한 기준 2]
```

### 코드 리뷰 호출 (파일 포함)

```markdown
## 리뷰 요청

**목표**: [구체적인 리뷰 관점]
**집중 영역**: [특히 봐야 할 부분]

## 대상 코드

[파일 내용 — 전체가 아닌 관련 섹션만]

## 이미 확인한 것

- [이미 검토한 항목들 — 중복 리뷰 방지]
```

### 버그 수정 호출

```markdown
## 버그 리포트

**증상**: [무슨 일이 일어나는가]
**예상 동작**: [무슨 일이 일어나야 하는가]
**재현 조건**: [어떤 상황에서 발생하는가]

## 실패 테스트

```python
# 이 테스트가 실패함
def test_xxx():
    ...
# Error: [에러 메시지 전문]
```

## 범위 제한

이 파일들만 수정 가능:
- [파일 1]
- [파일 2]
```

---

## 컨텍스트 크기 계산

서브에이전트 호출 전 항상 계산:

```python
# 호출 전 체크리스트
def pre_subagent_check(spec: str, files: list[str]) -> bool:
    estimated_tokens = (
        len(spec) // 4 +           # Spec 토큰
        sum(file_size(f) for f in files) // 4  # 파일 토큰
    )
    
    SUBAGENT_BUDGET = 20_000  # 서브에이전트 최대 컨텍스트
    
    if estimated_tokens > SUBAGENT_BUDGET:
        # 파일 섹션으로 축소
        return False  # 재조정 필요
    
    return True
```

### 파일 크기별 전달 방식

| 파일 크기 | 전달 방식 |
|---|---|
| < 100줄 | 전체 전달 |
| 100–300줄 | 관련 섹션만 (함수 단위) |
| 300줄+ | 인터페이스 시그니처만 + 관련 함수 |
| 1,000줄+ | 절대 전달 금지 — 필요 부분 발췌 |

---

## 결과 수신 패턴

서브에이전트에게 항상 요약 형식으로 반환 요청:

```markdown
## 응답 형식 (반드시 준수)

### 상태
DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT

### 완료한 것
[2-3줄 요약]

### 결정 사항
[중요한 결정과 이유]

### 다음 필요한 것
[후속 작업이 있다면]

### 주의사항
[있다면]
```

---

## 병렬 호출 패턴

독립적인 태스크는 병렬로:

```python
# 순서 의존성 없는 태스크들
PARALLEL_TASKS = [
    ("python-reviewer", review_spec),     # 코드 리뷰
    ("tdd-guide", test_spec),             # 테스트 커버리지
    ("context-guardian", context_spec),   # 컨텍스트 상태
]

# 각자 최소 컨텍스트로 독립 실행
# 한 에이전트 실패해도 다른 에이전트 계속 진행
```

---

## 안티패턴 (금지)

```python
# ❌ 전체 히스토리 전달
subagent_call(context=entire_conversation_history)

# ❌ 관련 없는 파일 포함
subagent_call(files=["main.py", "utils.py", "config.py", "tests/..."])

# ❌ 완료된 작업 재전달
subagent_call(context="이전에 auth.py를 이렇게 만들었고, 그 전에...")

# ✅ 올바른 호출
subagent_call(
    spec=current_task_spec,       # 현재 태스크만
    files=["relevant_file.py"],   # 직접 관련 파일만
    interface=interface_def,      # 인터페이스 정의
)
```
