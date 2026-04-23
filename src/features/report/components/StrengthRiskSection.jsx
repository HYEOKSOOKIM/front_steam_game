function CardList({ values }) {
  const items = Array.isArray(values) ? values : [];
  if (items.length === 0) {
    return <p className="placeholder">판단에 필요한 신호가 충분하지 않습니다.</p>;
  }

  return (
    <>
      {items.slice(0, 3).map((value, index) => (
        <article className="mini-card" key={`${value?.title || "card"}-${index}`}>
          <h3>{String(value?.title || "-")}</h3>
          <p>{String(value?.summary || "-")}</p>
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
      <article className="section-card">
        <div className="section-title-row">
          <h2>이런 점이 좋아요</h2>
        </div>
        <div className="stack-list">
          <CardList values={strengthItems} />
        </div>
      </article>
      <article className="section-card">
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
