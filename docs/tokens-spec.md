# Token Spec

## 1. 목적

- 이 문서는 `src/styles/tokens.css`의 네이밍, 계층, 사용 규칙을 정의한다.
- 목적은 Steam 유사 톤을 유지하면서도 확장 가능한 토큰 시스템을 운영하는 것이다.

## 2. 토큰 계층

### 2.1 `ref-*` (reference)

- 브랜드 원본 팔레트 값.
- 컴포넌트에서 직접 사용하지 않는다.
- 예: `--ref-steam-blue-70`, `--ref-steam-navy-20`

### 2.2 `sys-*` (system)

- 의미 기반 전역 역할.
- 화면/기능 공통 역할 정의에 사용한다.
- 예: `--sys-color-primary`, `--sys-color-surface-container-high`

### 2.3 `comp-*` (component)

- 컴포넌트 단위의 구체적 스타일 역할.
- 컴포넌트 구현은 가능한 `comp` 토큰을 우선 사용한다.
- 예: `--comp-button-filled-bg`, `--comp-input-border-focus`

### 2.4 semantic alias

- 도메인 의사결정 표현에 사용.
- 예: `--buy-now`, `--buy-wait`, `--buy-avoid`

### 2.5 legacy alias

- 기존 UI 호환용.
- 신규 구현에서는 추가 확대를 지양한다.
- 예: `--bg`, `--card`, `--brand`, `--line`

## 3. 네이밍 규칙

- 접두어는 `ref`, `sys`, `comp`, `type`, `shape`, `state`, `motion`, `layout`, `space`를 사용한다.
- 색상 역할은 `color-` 하위 네임스페이스를 사용한다.
- 상태 접미어는 `-hover`, `-focus`, `-pressed`, `-disabled`를 사용한다.
- 약어는 최소화하고 의미가 드러나는 단어를 사용한다.

## 4. 색상 규칙

- 브랜드 기조는 Steam 유사 다크 네이비 + 블루 강조를 유지한다.
- `sys` 역할은 아래 우선순위로 사용한다.
- 배경/표면: `background`, `surface*`, `surface-container*`
- 텍스트: `on-*`, `on-surface`, `on-surface-variant`
- 경계: `outline`, `outline-variant`
- 상태: `error`, `warning`, `success`, `neutral`
- 텍스트와 배경 조합은 WCAG AA 대비를 목표로 한다.

## 5. 타이포 규칙

- 의미형 토큰(`type-*`)을 기본으로 사용한다.
- 숫자형 크기 토큰(`font-size-*`)은 legacy 지원 목적으로만 유지한다.
- 권장 매핑:
- 페이지 메인 타이틀: `type-display-large-*`
- 섹션 타이틀: `type-headline-large-*` 또는 `type-title-large-*`
- 본문: `type-body-large-*` 또는 `type-body-medium-*`
- 보조 라벨/캡션: `type-label-*`

## 6. Shape/Elevation 규칙

- 라운드는 `shape-corner-*` 스케일을 우선 사용한다.
- 컴포넌트별 기본값:
- 버튼/입력: `shape-corner-small` 또는 `shape-corner-medium`
- 카드: `shape-corner-medium`
- 모달/패널: `shape-corner-large`
- 그림자는 `shadow-elevation-*` 스케일 내부에서만 사용한다.

## 7. Motion/State 규칙

- duration은 `motion-duration-*` 스케일을 사용한다.
- easing은 `motion-ease-*`만 사용한다.
- 인터랙션 레이어 투명도는 `state-*`를 사용한다.

## 8. 금지 규칙

- 컴포넌트 파일에서 hex/rgb/hsl 직접 사용 금지
- 임의 `px` 값 하드코딩으로 spacing/radius를 우회 금지
- 토큰 계층을 건너뛰는 직접 참조 금지(`ref -> comp` 직결)

## 9. 변경 절차

- 1단계: 사용 목적 정의
- 2단계: 기존 토큰으로 해결 가능한지 검토
- 3단계: 신규 토큰 추가 및 하위 호환 영향 검토
- 4단계: 문서 반영(`design-language`, `token-spec`, `component-contract`)
- 5단계: 마이그레이션 항목 등록

## 10. 버전 정책

- 토큰 제거/이름 변경은 breaking change로 간주한다.
- breaking change는 최소 1회 릴리스 동안 deprecated alias를 제공한다.
- deprecated 토큰은 제거 예정 버전을 명시한다.
