# Git 워크플로우 규칙

> **결구 원칙**: 브랜치는 격리된 첨차다. 메인 기둥을 직접 건드리지 않는다.

---

## 브랜치 전략

```bash
main          # 항상 배포 가능한 상태
├── feat/     # 새 기능 (feat/user-auth)
├── fix/      # 버그 수정 (fix/login-crash)
├── refactor/ # 리팩토링 (refactor/auth-module)
└── test/     # 테스트 추가 (test/payment-edge-cases)
```

## 커밋 컨벤션

```
<type>(<scope>): <description>

type: feat | fix | test | refactor | docs | chore
scope: 모듈명 (선택)
description: 현재형 동사로 시작, 50자 이내
```

### 예시
```bash
git commit -m "test(auth): user cannot login with expired token - failing"
git commit -m "feat(auth): validate token expiry on login - passing"
git commit -m "refactor(auth): extract token validation to service"
```

## TDD 커밋 리듬

```bash
# RED 단계 후
git add tests/
git commit -m "test: [동작] - failing"

# GREEN 단계 후
git add src/ tests/
git commit -m "feat: [구현] - passing"

# REFACTOR 단계 후
git add src/
git commit -m "refactor: [정리]"
```

## PR 규칙

- PR은 단일 논리적 변경만 포함
- 모든 테스트 통과 필수
- 커버리지 감소 시 PR 거부
- 셀프 리뷰 후 `agents/python-reviewer`에 위임
