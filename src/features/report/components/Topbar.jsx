export default function Topbar({
  onBackHome,
  onResetSearch,
  showResetSearch,
  brand = "Steam Review Report",
  subtitle = "한국 유저 리뷰로 보는 게임 리포트",
  resetLabel = "다른 게임 검색",
  homeLabel = "메인으로",
}) {
  return (
    <header className="report-topbar">
      <div className="brand-block">
        <p className="brand">{brand}</p>
        <p className="brand-subtitle">{subtitle}</p>
      </div>
      <div className="topbar-actions">
        {showResetSearch ? (
          <button className="report-back-btn" type="button" onClick={onResetSearch}>
            {resetLabel}
          </button>
        ) : null}
        <button className="report-back-btn" type="button" onClick={onBackHome}>
          {homeLabel}
        </button>
      </div>
    </header>
  );
}
