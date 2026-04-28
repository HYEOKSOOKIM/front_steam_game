function CardList({ values }) {
  const items = Array.isArray(values) ? values : [];
  if (items.length === 0) {
    return <p className="placeholder">아직 충분히 정리된 신호가 없어요.</p>;
  }

  return (
    <>
      {items.slice(0, 3).map((value, index) => (
        <article className="mini-card" key={`${value?.title || "card"}-${index}`}>
          <div className="mini-card-head">
            <h3>{String(value?.title || "-")}</h3>
          </div>
          <div className="mini-card-body">
            <p>{String(value?.summary || "-")}</p>
          </div>
        </article>
      ))}
    </>
  );
}

export default function StrengthRiskSection({ strengths, risks }) {
  const strengthItems = Array.isArray(strengths) ? strengths : [];
  const riskItems = Array.isArray(risks) ? risks : [];

  return (
    <section className="strength-risk-grid">
      <article className="section-card strength-section-card tone-panel-positive">
        <div className="section-title-row">
          <h2>이런 점이 좋아요</h2>
        </div>
        <div className="stack-list">
          <CardList values={strengthItems} />
        </div>
      </article>
      <article className="section-card risk-section-card tone-panel-negative">
        <div className="section-title-row">
          <h2>이건 알고 가세요</h2>
        </div>
        <div className="stack-list">
          <CardList values={riskItems} />
        </div>
      </article>
    </section>
  );
}
