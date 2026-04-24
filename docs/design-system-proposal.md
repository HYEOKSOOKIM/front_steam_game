# Frontend Design System Proposal

색은 Steam처럼 차분한 다크 네이비 + 블루를 유지하고, 구조는 Carbon v11처럼 토큰 중심·계층 중심으로 가져간다.
Carbon v11은 시각 브랜드를 갈아엎기보다 토큰 이름과 구조를 더 예측 가능하게 정리하고, CSS grid 기반 레이아웃을 강화한 버전이다. 또 Carbon은 제품 UI에서 생산성 중심의 productive 타입셋을, 더 강조가 필요한 순간에는 expressive 타입셋을 병행하도록 안내한다.

## 1. 디자인 철학 요약

이 시스템의 목표는 "멋있어 보이는 화면"이 아니라 읽기 쉬운 판단형 인터페이스다.

Steam에서 가져올 것은 색의 분위기다.  
Carbon에서 가져올 것은 구조다.

그래서 원칙은 4개로 잡는다.

첫째, 정보 위계가 색보다 먼저 보이게 한다.  
둘째, hover는 강조가 아니라 상태 확인용으로만 쓴다.  
셋째, 카드는 많이 띄우지 않고, surface 단계로만 층을 만든다.  
넷째, 색은 감정 표현이 아니라 의미 표현에만 쓴다.

Carbon은 2x Grid, 타입 토큰, 상태 토큰, 접근성 중심 포커스 규칙을 일관된 시스템으로 쓰는 쪽에 가깝다. 특히 포커스 상태는 모든 인터랙티브 요소에 필요하고 3:1 대비를 충족해야 하며, 다크 테마에서는 밝은 포커스 표시를 권장한다.

## 2. 색상 시스템 정의

색은 "보기 좋은 조합"이 아니라 역할별 구분으로 설계한다.

### ref palette

이건 원본 팔레트다. 컴포넌트에서 직접 쓰지 않는다.

- navy: 10 / 20 / 30 / 40 / 50
- blue: 40 / 60 / 70 / 80
- text: 100 / 70 / 50
- state: success / warning / error / neutral / mint

### sys color roles

이건 화면 전역 역할이다.

- background: 앱 전체 배경
- surface, surface-container-*: 카드와 패널 계층
- on-surface, on-surface-variant, on-surface-muted: 텍스트 계층
- outline, outline-variant: 경계선
- primary, primary-hover, primary-container: 기본 강조
- focus-ring: 포커스 전용
- success, warning, error, neutral: 상태 의미

### 실제 사용 원칙

- 본문 배경: background
- 상단 바/패널: surface-container
- 카드: surface-container-high
- 카드 안 보조 블록: surface-container-highest
- 큰 제목: on-surface
- 보조 설명: on-surface-variant
- 메타/캡션: on-surface-muted
- 경계: outline-variant
- 버튼/링크/강조 라벨: primary

이 구조를 쓰면 "밝은 hover 배경 때문에 텍스트가 죽는 문제"가 구조적으로 줄어든다. hover는 배경을 뒤집는 대신 overlay + border + shadow로만 처리하기 때문이다.

## 3. 타이포 시스템

Carbon은 productive와 expressive 두 타입셋을 둔다. 제품성 UI에는 productive가 기본이고, 강조가 필요한 hero나 메인 헤드라인만 expressive하게 가져가는 방식이 안정적이다. productive는 14px base, expressive는 16px base를 쓴다.

이 서비스에는 이렇게 적용하면 된다.

### display

리포트 hero, 검색 메인 타이틀, 핵심 결론 한 줄

### heading

섹션 제목, 카드 제목, evidence 그룹 제목

### body

설명문, 리포트 해설, 실제 리뷰 인용

### label

배지, 상태칩, 메타 정보, 수치 라벨

### 실제 적용 규칙

- hero headline만 display
- 페이지/섹션 타이틀은 heading
- 카드 본문은 body
- 리뷰 인용은 body-sm
- 메타/상태/날짜는 label

### 금지

- 같은 카드 안에서 제목/요약/본문이 모두 비슷한 weight와 color를 갖는 것
- 본문에 display 계열 쓰는 것
- 배지와 제목의 대비가 비슷한 것

## 4. spacing / layout 시스템

Carbon 2x Grid는 일관된 레이아웃 리듬과 16-column 구조를 강조한다. v11도 CSS grid 기반 레이아웃 강화를 핵심 변화 중 하나로 본다.

여기서는 실제 구현용으로 단순화해서 이렇게 간다.

### spacing scale

2, 4, 8, 12, 16, 24, 32, 48, 64

### container

- app max width: 1200px
- content gutter: 16px
- dense dashboard section gutter: 12px
- vertical section gap: 16px
- hero block gap: 24px

### grid 원칙

- desktop: 12-column 운영
- tablet: 8-column
- mobile: 4-column
- report 메인 구조는 1, 2, 3열까지만 허용
- evidence 리스트는 1열 기본, dense 카드만 내부 2열 허용

### 카드 내부 간격

- header ↔ body: 12px
- body ↔ body: 8px
- meta grid gap: 8px
- section ↔ section: 16px

## 5. 상태 / 인터랙션 시스템

이 부분이 제일 중요하다.

지금 생겼던 문제는 대부분 hover를 색 변경으로 처리해서 생겼다.  
새 규칙은 이렇다.

### hover

- 텍스트 색 바꾸지 않음
- 배경도 거의 유지
- overlay를 아주 약하게 씌움
- border 1단계 강조
- shadow 1단계 추가 가능

### focus-visible

- 항상 표시
- 다크 배경에서는 밝은 ring 사용
- ring + offset 사용
- 배경색으로만 focus 표현 금지

Carbon은 포커스가 항상 보여야 하고 충분한 대비를 가져야 한다고 명시한다. 다크 계열에서는 보통 밝은 포커스 경계를 쓴다.

### active / pressed

- overlay opacity만 소폭 증가
- scale animation 금지
- 색 반전 금지

### disabled

- opacity와 cursor만 낮춤
- 텍스트 대비는 유지
- 상태 의미는 남겨둠

### overlay 원칙

- hover: 0.06 ~ 0.08
- focus: 0.12
- pressed: 0.14
- selected: 0.12 + border 강조

## 6. 컴포넌트 설계 규칙

### Card

- 배경: comp-card-bg
- 강조 카드: comp-card-bg-strong
- 보더: 항상 기본 보더 유지
- shadow는 hero, modal, floating panel만
- hover는 background 대체가 아니라 overlay

### Button

- filled / outlined / ghost 3종
- 최소 높이 40
- label은 항상 high contrast
- hover 시 밝아지는 게 아니라 tone shift만
- focus-visible ring 필수

### Input

- default / hover / focus / error / disabled / readonly
- placeholder는 muted
- focus 시 border만 primary로
- glow 금지

### Badge / Chip

- 의미형만 색 사용
- 상태 색은 배경 전체가 아니라 얕은 tint + border + label 조합
- count chip, tone chip, buy chip 모두 같은 구조 사용

### List / Evidence card

- 제목 / 요약 / 인용 / action 계층을 분리
- hover로 카드 전체가 밝아지지 않음
- 인용은 작은 body와 좌측 rule 사용
- "더 보기" 링크는 link tone만 쓰고 별도 버튼처럼 보이지 않게
