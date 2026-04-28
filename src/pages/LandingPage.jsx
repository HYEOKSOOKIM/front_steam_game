import { useNavigate } from "react-router-dom";
import "./landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-shell">
      <div className="landing-hero">
        <p className="landing-kicker">Steam Insights</p>
        <h1 className="landing-title">한 번의 선택으로, 게임 탐색을 더 빠르게</h1>
        <p className="landing-subtitle">
          원하는 방식으로 시작하세요. 자연어 추천으로 빠르게 찾거나, 리뷰 분석 리포트로
          구매 판단을 도와드립니다.
        </p>
      </div>

      <section className="landing-cards" aria-label="서비스 선택">
        <button className="landing-card" onClick={() => navigate("/recommend")}>
          <p className="landing-card-kicker">Path 01</p>
          <h2 className="landing-card-title">게임 추천 받기</h2>
          <p className="landing-card-desc">
            자연어 또는 취향 기반 입력으로 Top 추천을 확인하고, 이미 플레이한 게임은
            제외해서 더 정확하게 찾습니다.
          </p>
          <span className="landing-card-cta">추천 시작하기</span>
        </button>

        <button className="landing-card" onClick={() => navigate("/report")}>
          <p className="landing-card-kicker">Path 02</p>
          <h2 className="landing-card-title">게임 리포트 보기</h2>
          <p className="landing-card-desc">
            특정 게임의 리뷰 근거를 요약해 강점, 리스크, 현재 상태를 한 화면에서 빠르게
            파악할 수 있습니다.
          </p>
          <span className="landing-card-cta">리포트 확인하기</span>
        </button>
      </section>

      <p className="landing-footnote">
        추천과 리포트는 동일한 Steam 리뷰 데이터 기반으로 동작합니다.
      </p>
    </main>
  );
}

