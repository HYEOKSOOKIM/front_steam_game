export default function Topbar({ onBackHome, onResetSearch, showResetSearch }) {
  return (
    <header className="report-topbar">
      <div className="brand-block">
        <p className="brand">Steam Report</p>
        <p className="brand-subtitle">한국 유저 리뷰로 보는 게임 리포트</p>
      </div>
      <div className="topbar-actions">
        {showResetSearch ? (
          <button className="report-back-btn" type="button" onClick={onResetSearch}>
            다른 게임 검색
          </button>
        ) : null}
        <button className="report-back-btn" type="button" onClick={onBackHome}>
          메인으로
        </button>
      </div>
    </header>
  );
}
