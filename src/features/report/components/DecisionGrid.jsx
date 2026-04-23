export default function DecisionGrid({
  buyTimingSummary,
  recommendationBadgeClass,
  recommendationLabel,
  recentStateSummary,
  recentStateLabel,
  recentStateTone,
}) {
  const statusClass = `status-chip status-${recentStateTone || "neutral"}`;

  return (
    <section className="decision-grid">
      <article className="section-card">
        <div className="section-title-row">
          <h2>지금 사도 될까?</h2>
          <span className={recommendationBadgeClass}>{recommendationLabel || "-"}</span>
        </div>
        <div className="summary-panel">
          <p className="section-body">{buyTimingSummary || "-"}</p>
        </div>
      </article>
      <article className="section-card">
        <div className="section-title-row">
          <h2>요즘 평은 어때요?</h2>
          <span className={statusClass}>{recentStateLabel || "-"}</span>
        </div>
        <div className="summary-panel">
          <p className="section-body">{recentStateSummary || "-"}</p>
        </div>
      </article>
    </section>
  );
}
