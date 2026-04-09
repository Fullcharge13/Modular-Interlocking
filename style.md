# Python 스타일 규칙

> **결구 원칙**: Python 파일에 항상 적용됩니다.

---

## 기본 설정

```toml
# pyproject.toml
[tool.ruff]
line-length = 88
target-version = "py311"
select = ["E", "F", "I", "N", "UP", "B", "SIM"]

[tool.mypy]
strict = true
python_version = "3.11"
```

---

## 코드 구조 원칙

### 타입 힌트 필수
```python
# ❌ 금지
def process(data, config):
    pass

# ✅ 필수
def process(data: list[dict], config: ProcessConfig) -> ProcessResult:
    pass
```

### 불변성 우선
```python
# ❌ 가변 기본값
def add_item(items: list = []):
    pass

# ✅ 불변 기본값
def add_item(items: list | None = None) -> list:
    if items is None:
        items = []
    return items
```

### 단일 책임
```python
# 함수: 한 가지 일만
# 클래스: 한 가지 책임만
# 파일: 한 가지 도메인만
# 최대 함수 길이: 30줄
# 최대 클래스 길이: 150줄
```

---

## 디렉토리 구조

```
src/
├── domain/          # 비즈니스 로직 (외부 의존성 없음)
│   ├── models.py
│   └── services.py
├── adapters/        # 외부 시스템 어댑터
│   ├── db.py
│   └── api.py
└── entrypoints/     # 진입점 (CLI, HTTP, etc.)
    └── main.py

tests/
├── unit/            # domain/ 테스트
├── integration/     # adapters/ 테스트
└── e2e/             # 전체 흐름 테스트
```

---

## 금지 패턴

```python
# ❌ 마법 숫자
if status == 3:

# ✅ 명명된 상수
if status == UserStatus.SUSPENDED:

# ❌ 긴 if-elif 체인 (5개 이상)
# ✅ 딕셔너리 디스패치 또는 전략 패턴

# ❌ 예외를 삼키기
except Exception:
    pass

# ✅ 구체적 예외 처리
except ValueError as e:
    logger.error("Invalid input: %s", e)
    raise
```
