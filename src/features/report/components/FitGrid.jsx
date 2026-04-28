function BulletList({ values }) {
  const items = Array.isArray(values) ? values : [];
  if (items.length === 0) {
    return <p className="placeholder">아직 충분히 정리된 데이터가 없어요.</p>;
  }

  return (
    <ul className="bullet-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

export default function FitGrid({ goodFor, notGoodFor }) {
  const goodItems = Array.isArray(goodFor) ? goodFor : [];
  const cautionItems = Array.isArray(notGoodFor) ? notGoodFor : [];

  return (
    <section className="fit-grid">
      <article className="section-card fit-section-card fit-section-card-positive tone-panel-positive">
        <div className="section-title-row">
          <h2>이런 분께 추천해요</h2>
        </div>
        <div className="fit-card-body">
          <BulletList values={goodItems} />
        </div>
      </article>
      <article className="section-card fit-section-card fit-section-card-negative tone-panel-negative">
        <div className="section-title-row">
          <h2>이런 분께는 아쉬울 수 있어요</h2>
        </div>
        <div className="fit-card-body">
          <BulletList values={cautionItems} />
        </div>
      </article>
    </section>
  );
}
