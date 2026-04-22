export default function DecisionGrid({
  buyTimingSummary,
  recentStateSummary,
  recentStateLabel,
  recentStateTone,
  generatedAt,
}) {
  const statusClass = `status-chip status-${recentStateTone || "neutral"}`;

  return (
    <section className="decision-grid">
      <article className="section-card">
        <h2>구매 타이밍</h2>
        <p className="section-body">{buyTimingSummary || "-"}</p>
      </article>
      <article className="section-card">
        <div className="section-title-row">
          <h2>최근 리뷰 흐름</h2>
          <span className={statusClass}>{recentStateLabel || "-"}</span>
        </div>
        <p className="section-body">{recentStateSummary || "-"}</p>
      </article>
      <article className="section-card">
        <h2>분석 기준</h2>
        <p className="section-body">반복적으로 관찰된 리뷰 신호를 구매 판단 관점으로 요약했습니다.</p>
        <p className="section-kicker">{generatedAt || "-"}</p>
      </article>
    </section>
  );
}
