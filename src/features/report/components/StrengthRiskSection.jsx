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
  return (
    <section className="strength-risk-grid">
      <article className="section-card">
        <h2>구매 이유</h2>
        <div className="stack-list">
          <CardList values={strengths} />
        </div>
      </article>
      <article className="section-card">
        <h2>구매 전 확인할 리스크</h2>
        <div className="stack-list">
          <CardList values={risks} />
        </div>
      </article>
    </section>
  );
}
