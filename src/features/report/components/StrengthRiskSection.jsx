function CardList({ values, tone }) {
  const items = Array.isArray(values) ? values : [];
  if (items.length === 0) {
    return <p className="strength-risk-empty">아직 충분히 정리된 신호가 없어요.</p>;
  }

  return (
    <ul className="strength-risk-list">
      {items.slice(0, 3).map((value, index) => {
        const title = String(value?.title || "").trim();
        const summary = String(value?.summary || "-").trim();
        const content = title ? `${title}: ${summary}` : summary;

        return (
          <li className={`strength-risk-item strength-risk-item--${tone}`} key={`${title || "item"}-${index}`}>
            {content}
          </li>
        );
      })}
    </ul>
  );
}

export default function StrengthRiskSection({ strengths, risks }) {
  const strengthItems = Array.isArray(strengths) ? strengths : [];
  const riskItems = Array.isArray(risks) ? risks : [];

  return (
    <section className="strength-risk-grid">
      <article className="section-card strength-section-card tone-panel-positive report-summary-card">
        <div className="mock-report-card__label">강점</div>
        <CardList values={strengthItems} tone="strength" />
      </article>
      <article className="section-card risk-section-card tone-panel-negative report-summary-card">
        <div className="mock-report-card__label">리스크</div>
        <CardList values={riskItems} tone="risk" />
      </article>
    </section>
  );
}
