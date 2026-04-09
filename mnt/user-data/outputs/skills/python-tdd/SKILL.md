# Python TDD Workflow

> **주두 원칙**: TDD의 도메인 지식을 이 skill에 집중시켜,
> 에이전트는 "어떻게 TDD를 하는가"를 매번 재계산하지 않는다.

---

## 역할

Python 프로젝트에서 RED → GREEN → REFACTOR 사이클을 표준화된 절차로 실행한다.
`tdd-guide` 에이전트가 이 skill을 참조하여 일관된 TDD를 강제한다.

---

## 사전 준비

```bash
# 프로젝트 최초 설정
pip install pytest pytest-cov pytest-mock pytest-watch

# pyproject.toml에 추가
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=src --cov-report=term-missing -v"
markers = [
    "unit: 단위 테스트",
    "integration: 통합 테스트",
    "e2e: E2E 테스트",
]
```

---

## 사이클 실행 절차

### 🔴 RED 단계

```python
# 1. 테스트 파일 위치 결정
# src/domain/user_service.py → tests/unit/test_user_service.py

# 2. 최소 테스트 작성 (하나의 동작만)
# tests/unit/test_user_service.py

import pytest
from src.domain.user_service import UserService  # 아직 없음

class TestUserRegistration:
    def test_새_사용자_등록_성공(self):
        # Given
        service = UserService()
        
        # When
        result = service.register(
            email="new@example.com",
            password="Valid_Pass1!"
        )
        
        # Then
        assert result.success is True
        assert result.user.email == "new@example.com"
```

```bash
# 3. 실행 → 반드시 실패
pytest tests/unit/test_user_service.py -v
# 예상 결과: ImportError 또는 AttributeError
# ❌ FAILED (올바른 실패)

# 4. RED 커밋
git add tests/unit/test_user_service.py
git commit -m "test(user): 새 사용자 등록 성공 동작 정의 - failing"
```

---

### 🟢 GREEN 단계

```python
# 5. 테스트를 통과시키는 가장 단순한 코드
# src/domain/user_service.py

from dataclasses import dataclass

@dataclass
class RegisterResult:
    success: bool
    user: "User | None" = None

@dataclass  
class User:
    email: str

class UserService:
    def register(self, email: str, password: str) -> RegisterResult:
        # 지금은 단순하게 — 나중에 추가 로직
        user = User(email=email)
        return RegisterResult(success=True, user=user)
```

```bash
# 6. 실행 → 통과
pytest tests/unit/test_user_service.py -v
# ✅ PASSED

# 7. 전체 스위트 실행
pytest
# ✅ ALL PASSED

# 8. GREEN 커밋
git add src/domain/user_service.py
git commit -m "feat(user): 새 사용자 등록 최소 구현 - passing"
```

---

### 🔵 REFACTOR 단계

```bash
# 9. 코드 정리 (동작 변경 없이)
# - 타입 힌트 완성
# - 명명 개선
# - 추출 가능한 함수 분리
# - 중복 제거

# 10. 매 변경 후 전체 스위트
pytest
# ✅ ALL PASSED (변경 후에도)

# 11. REFACTOR 커밋
git commit -m "refactor(user): User 도메인 모델 타입 힌트 완성"
```

---

## 다음 테스트 선택 전략

RED 단계에서 다음에 무엇을 테스트할지 결정하는 기준:

```python
# 우선순위 (높은 것부터)
1. 현재 테스트의 다음 당연한 엣지 케이스
   # test_등록_성공 → test_중복_이메일_거부

2. 실패 케이스 (해피 패스 직후)
   # test_등록_성공 → test_잘못된_이메일_형식_거부

3. 경계값 테스트
   # test_비밀번호_최소_길이 → test_비밀번호_최대_길이

# 금지: 아직 구현하지 않은 큰 기능으로 점프
```

---

## 컨텍스트 효율화

TDD 사이클 중 컨텍스트 관리:

```
로드 필요:
✅ 현재 테스트 파일
✅ 현재 구현 파일
✅ conftest.py (픽스처)

로드 불필요:
❌ 완료된 다른 모듈의 테스트
❌ 관련 없는 설정 파일
❌ 전체 디렉토리 트리
```

> TDD 사이클 중에는 `compact-trigger`를 실행하지 않는다.
> GREEN 상태 확인 후, 다음 RED 시작 전에 필요하면 압축한다.

---

## 빠른 피드백 루프

```bash
# 개발 중 감시 모드 (변경 시 자동 실행)
ptw tests/unit/test_user_service.py -- -v

# 실패한 테스트만 재실행
pytest --lf -v

# 특정 테스트만 실행
pytest -k "test_등록" -v
```
