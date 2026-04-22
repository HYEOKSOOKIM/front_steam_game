export default function Topbar({
  games,
  selectedAppid,
  onSelectChange,
  onSubmit,
  isLoadingReport,
}) {
  return (
    <header className="report-topbar">
      <div className="brand-block">
        <p className="brand">Steam 구매 판단 리포트</p>
        <p className="brand-subtitle">리뷰 신호 기반 MVP</p>
      </div>
      <div className="topbar-actions">
        <form id="report-form" className="picker" onSubmit={onSubmit}>
          <label htmlFor="game-select" className="picker-label">
            게임
          </label>
          <select
            id="game-select"
            required
            value={selectedAppid}
            onChange={(event) => onSelectChange(event.target.value)}
          >
            {games.length === 0 ? (
              <option value="">준비된 리포트가 없습니다.</option>
            ) : null}
            {games.map((game) => (
              <option key={game.appid} value={String(game.appid)}>
                {game.name} ({game.appid})
              </option>
            ))}
          </select>
          <button id="load-button" type="submit" disabled={isLoadingReport}>
            {isLoadingReport ? "불러오는 중..." : "리포트 보기"}
          </button>
        </form>
      </div>
    </header>
  );
}
