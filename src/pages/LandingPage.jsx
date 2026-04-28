import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

const RECOMMEND_RESULTS = [
  { rank: 1, name: "Disco Elysium", badge: "높은 적합도", level: "high" },
  { rank: 2, name: "Divinity: Original Sin 2", badge: "높은 적합도", level: "high" },
  { rank: 3, name: "Baldur's Gate 3", badge: "중간 적합도", level: "mid" },
];

const REPORT_STRENGTHS = [
  "도전적인 난이도와 만족스러운 성장 곡선",
  "아름다운 수제 아트워크와 OST",
  "가격 대비 압도적인 볼륨",
];

export default function LandingPage() {
  const navigate = useNavigate();
  const featureARefs = useRef(null);
  const featureBRef  = useRef(null);
  const ctaRef       = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    [featureARefs, featureBRef, ctaRef].forEach((r) => r.current && observer.observe(r.current));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lp">

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero__content">
          <span className="lp-hero__badge">
            <span className="lp-hero__badge-dot" aria-hidden="true" />
            Steam Insights
          </span>

          <h1 className="lp-hero__title">
            다음 게임,<br />
            <em>이미 답이 있습니다</em>
          </h1>

          <p className="lp-hero__sub">
            Steam 리뷰 데이터로 당신에게 맞는 게임을 추천하고,<br />
            구매 전 꼭 알아야 할 것만 정리해 드립니다.
          </p>

          <div className="lp-hero__ctas">
            <button className="lp-btn lp-btn--filled lp-btn--lg" onClick={() => navigate("/recommend")}>
              게임 추천 받기
            </button>
            <button className="lp-btn lp-btn--outlined lp-btn--lg" onClick={() => navigate("/report")}>
              리포트 보기
            </button>
          </div>

          <p className="lp-hero__hint">Steam 리뷰 데이터 기반 · 별도 로그인 불필요</p>
        </div>

        <div className="lp-hero__scroll" aria-hidden="true">
          <span className="lp-hero__scroll-track"><span className="lp-hero__scroll-dot" /></span>
        </div>
      </section>

      {/* ── Feature A — 추천 ── */}
      <section className="lp-feature lp-feature--a" ref={featureARefs}>
        <div className="lp-feature__wrap">
          <div className="lp-feature__copy">
            <span className="lp-feature__path lp-feature__path--a">PATH 01</span>
            <h2 className="lp-feature__title">
              어떤 게임 할지<br />모르겠다면
            </h2>
            <p className="lp-feature__desc">
              원하는 분위기를 그냥 말하듯 입력하세요.<br />
              이미 플레이한 게임은 빼고, 지금 당신에게 맞는<br />
              게임 5개를 바로 찾아드립니다.
            </p>
            <button className="lp-btn lp-btn--filled" onClick={() => navigate("/recommend")}>
              추천 시작하기
              <ArrowIcon />
            </button>
          </div>

          <div className="lp-feature__demo">
            <MockupWindow>
              <div className="mock-input">
                <SearchIcon />
                <span className="mock-input__text">요즘 잔잔한 RPG 하고 싶은데...</span>
                <span className="mock-input__cursor" aria-hidden="true" />
              </div>
              <div className="mock-tags">
                <span className="mock-tag mock-tag--exclude">− 엘든링</span>
                <span className="mock-tag mock-tag--exclude">− 스타듀밸리</span>
                <span className="mock-tag mock-tag--add">+ 플레이한 게임 추가</span>
              </div>
              <div className="mock-divider" />
              <div className="mock-results">
                {RECOMMEND_RESULTS.map((g) => (
                  <div key={g.rank} className="mock-result">
                    <span className="mock-result__rank">{g.rank}</span>
                    <span className="mock-result__name">{g.name}</span>
                    <span className={`mock-result__badge mock-result__badge--${g.level}`}>
                      {g.badge}
                    </span>
                  </div>
                ))}
              </div>
            </MockupWindow>
          </div>
        </div>
      </section>

      {/* ── Feature B — 리포트 ── */}
      <section className="lp-feature lp-feature--b" ref={featureBRef}>
        <div className="lp-feature__wrap lp-feature__wrap--rev">
          <div className="lp-feature__demo">
            <MockupWindow>
              <div className="mock-report-header">
                <div className="mock-report-game">
                  <div className="mock-report-cover" aria-hidden="true" />
                  <div>
                    <div className="mock-report-name">Hollow Knight</div>
                    <div className="mock-report-meta">95% 긍정적 · 리뷰 127,450개</div>
                  </div>
                </div>
                <span className="mock-verdict">지금 사세요</span>
              </div>

              <div className="mock-report-grid">
                <div className="mock-report-card mock-report-card--strength">
                  <div className="mock-report-card__label">강점</div>
                  <ul>
                    {REPORT_STRENGTHS.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="mock-report-card mock-report-card--risk">
                  <div className="mock-report-card__label">리스크</div>
                  <ul>
                    <li>높은 난이도로 캐주얼 유저에게 불친절할 수 있음</li>
                  </ul>
                </div>
              </div>
            </MockupWindow>
          </div>

          <div className="lp-feature__copy">
            <span className="lp-feature__path lp-feature__path--b">PATH 02</span>
            <h2 className="lp-feature__title">
              살지 말지,<br />5초 만에 판단
            </h2>
            <p className="lp-feature__desc">
              리뷰 수천 개를 일일이 읽을 필요 없습니다.<br />
              강점, 리스크, 구매 판단을 AI가 정리해<br />
              한 화면에 보여드립니다.
            </p>
            <button className="lp-btn lp-btn--filled" onClick={() => navigate("/report")}>
              리포트 확인하기
              <ArrowIcon />
            </button>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="lp-cta" ref={ctaRef}>
        <div className="lp-cta__inner">
          <h2 className="lp-cta__title">지금 바로 시작하세요</h2>
          <p className="lp-cta__sub">로그인 없이, 무료로 사용할 수 있습니다.</p>
          <div className="lp-cta__buttons">
            <button className="lp-btn lp-btn--filled lp-btn--lg" onClick={() => navigate("/recommend")}>
              게임 추천 받기
            </button>
            <button className="lp-btn lp-btn--outlined lp-btn--lg" onClick={() => navigate("/report")}>
              리포트 보기
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

function MockupWindow({ children }) {
  return (
    <div className="mock-window">
      <div className="mock-window__bar" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="mock-window__body">{children}</div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path d="M2.5 7.5h10M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
      style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="4" stroke="var(--sys-color-on-surface-muted)" strokeWidth="1.2" />
      <path d="M9.5 9.5L12 12" stroke="var(--sys-color-on-surface-muted)" strokeWidth="1.2"
        strokeLinecap="round" />
    </svg>
  );
}
