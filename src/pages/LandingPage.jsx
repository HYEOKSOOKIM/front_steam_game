import { useNavigate } from "react-router-dom";
import "./landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-shell">
      <div className="landing-hero">
        <h1 className="landing-title">Steam Insights</h1>
        <p className="landing-subtitle">
          Steam 리뷰 데이터를 기반으로 게임을 분석하고 추천합니다.
        </p>
      </div>

      <div className="landing-cards">
        <button className="landing-card" onClick={() => navigate("/recommend")}>
          <span className="landing-card-icon">🎮</span>
          <h2 className="landing-card-title">게임 추천</h2>
          <p className="landing-card-desc">
            원하는 게임 스타일을 입력하면 리뷰 기반으로 Top 5 게임을 추천해드립니다.
          </p>
        </button>

        <button className="landing-card" onClick={() => navigate("/report")}>
          <span className="landing-card-icon">📊</span>
          <h2 className="landing-card-title">게임 분석</h2>
          <p className="landing-card-desc">
            특정 게임의 리뷰를 분석해 구매 판단에 필요한 정보를 한눈에 정리합니다.
          </p>
        </button>
      </div>
    </main>
  );
}
