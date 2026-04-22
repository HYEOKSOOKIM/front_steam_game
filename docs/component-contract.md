# Component Contract

## 1. 목적

- 이 문서는 컴포넌트가 반드시 따라야 하는 디자인 토큰 계약을 정의한다.
- 컴포넌트 구현 방식은 자유지만, 토큰 사용 규칙은 필수다.

## 2. 공통 계약

- 색상은 `sys` 또는 `comp` 토큰만 사용한다.
- 텍스트 스타일은 `type-*` 기준으로 선택한다.
- spacing은 `space-*`를 사용한다.
- corner는 `shape-corner-*`를 사용한다.
- 인터랙션 상태는 `state-*`, `motion-*`를 사용한다.

## 3. Button 계약

- 필수 상태: `default`, `hover`, `focus-visible`, `pressed`, `disabled`
- Filled 버튼 필수 토큰:
- `--comp-button-filled-bg`
- `--comp-button-filled-bg-hover`
- `--comp-button-filled-label`
- Outlined 버튼 필수 토큰:
- `--comp-button-outlined-bg`
- `--comp-button-outlined-border`
- `--comp-button-outlined-label`
- 포커스 링은 색상 대비가 충분해야 하며 키보드 탐색에서 항상 표시한다.

## 4. Input 계약

- 필수 상태: `default`, `hover`, `focus`, `error`, `disabled`, `readonly`
- 필수 토큰:
- `--comp-input-bg`
- `--comp-input-border`
- `--comp-input-border-focus`
- 오류 상태는 `--sys-color-error` 또는 `--sys-color-error-container` 기반으로 표현한다.

## 5. Card 계약

- 카드 배경은 `--comp-card-bg` 또는 `--comp-card-bg-strong`을 사용한다.
- 경계는 `--comp-card-border`를 기본으로 사용한다.
- 정보 밀도가 높은 카드에서만 `shadow-elevation-*` 사용을 허용한다.

## 6. Badge/Chip 계약

- 의미형 상태는 `success/warning/error/neutral` 역할 색상과 연결한다.
- 텍스트는 항상 `on-*` 역할과 조합해 대비를 확보한다.

## 7. Table/List 계약

- 행 구분선은 `outline-variant` 계열 사용을 권장한다.
- 선택/호버 상태는 `state-hover-opacity` 기반 오버레이를 사용한다.

## 8. 도메인 상태 계약 (Recommendation)

- `buy-now`: 즉시 구매 권장
- `buy-sale`: 할인 구매 권장
- `buy-free`: 무료 획득 권장
- `buy-try`: 체험/데모 권장
- `buy-wait`: 보류 권장
- `buy-avoid`: 비권장
- 각 상태는 아이콘/텍스트 라벨을 함께 제공한다.

## 9. 접근성 계약

- 텍스트 대비 WCAG AA 이상 목표
- 색상 단독 의미 전달 금지
- 최소 클릭 타겟 `40x40`
- 키보드 포커스 이동 순서 보장

## 10. 품질 체크리스트

- raw color 하드코딩이 없는가
- 필수 상태가 모두 구현되었는가
- 토큰 계층 규칙을 위반하지 않았는가
- 다크 배경에서 대비가 충분한가
- 모바일 뷰포트에서 터치 타겟이 충분한가
