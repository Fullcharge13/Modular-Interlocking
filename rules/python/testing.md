# Python 테스팅 규칙

> **결구 원칙**: Python 테스트 파일에 항상 적용됩니다.

---

## pytest 표준 패턴

### Given-When-Then 구조
```python
def test_user_cannot_login_with_wrong_password():
    # Given
    user = User(email="test@example.com", password_hash=hash("correct"))
    
    # When
    result = auth_service.login("test@example.com", "wrong_password")
    
    # Then
    assert result.success is False
    assert result.error == AuthError.INVALID_CREDENTIALS
```

### Fixture 패턴
```python
# conftest.py — 공유 픽스처
@pytest.fixture
def db_session():
    session = create_test_session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def user_factory(db_session):
    def _create(**kwargs):
        defaults = {"email": "test@example.com", "role": "user"}
        return User.create(**{**defaults, **kwargs}, session=db_session)
    return _create
```

### 목킹 패턴
```python
# 외부 의존성만 목킹 (도메인 로직은 실제 사용)
def test_sends_welcome_email(mocker):
    mock_email = mocker.patch("adapters.email.send")
    
    user_service.register("new@example.com")
    
    mock_email.assert_called_once_with(
        to="new@example.com",
        template="welcome"
    )
```

---

## 테스트 분류

```python
# 단위 테스트 — 빠름, 외부 의존성 없음
@pytest.mark.unit
def test_password_hashing():
    ...

# 통합 테스트 — DB, 캐시 포함
@pytest.mark.integration
def test_user_persisted_to_db():
    ...

# E2E 테스트 — 전체 HTTP 스택
@pytest.mark.e2e
def test_login_flow():
    ...
```

```bash
# 단위 테스트만 (빠른 피드백)
pytest -m unit

# 전체 실행 (CI)
pytest

# 커버리지 리포트
pytest --cov=src --cov-report=html
```

---

## 파라미터화 테스트

```python
@pytest.mark.parametrize("password,expected", [
    ("short", False),
    ("no_uppercase1!", False),
    ("NoSpecial123", False),
    ("Valid_Pass1!", True),
])
def test_password_validation(password: str, expected: bool):
    assert validate_password(password) == expected
```

---

## 테스트 파일 명명

```
tests/
├── unit/
│   └── test_<module>.py          # test_user_service.py
├── integration/
│   └── test_<adapter>.py         # test_db_adapter.py
└── e2e/
    └── test_<flow>.py            # test_login_flow.py
```
