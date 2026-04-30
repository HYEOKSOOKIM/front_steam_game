export default function DecisionGrid({
  buyTimingSummary,
  recommendationBadgeClass,
  recommendationLabel,
}) {
  return (
    <section className="decision-grid decision-grid-single">
      <article className="section-card decision-card">
        <div className="decision-card-head">
          <div className="section-title-row">
            <h2>지금 사도 될까?</h2>
            <span className={recommendationBadgeClass}>{recommendationLabel || "-"}</span>
          </div>
        </div>
        <div className="decision-card-body">
          <div className="summary-panel">
            <p className="section-body">{buyTimingSummary || "-"}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
