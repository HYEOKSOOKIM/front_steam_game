function CountChip({ count, tone }) {
  return <span className={`count-chip tone-${tone}`}>{count}개</span>;
}

function BulletList({ values }) {
  const items = Array.isArray(values) ? values : [];
  if (items.length === 0) {
    return <p className="placeholder">판단에 필요한 데이터가 충분하지 않습니다.</p>;
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
      <article className="section-card">
        <div className="section-title-row">
          <h2>잘 맞는 플레이어</h2>
          <CountChip count={goodItems.length} tone="positive" />
        </div>
        <BulletList values={goodItems} />
      </article>
      <article className="section-card">
        <div className="section-title-row">
          <h2>주의가 필요한 플레이어</h2>
          <CountChip count={cautionItems.length} tone="warning" />
        </div>
        <BulletList values={cautionItems} />
      </article>
    </section>
  );
}
