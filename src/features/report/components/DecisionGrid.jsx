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
        <h2>지금 사도 될까?</h2>
        <p className="section-body">{buyTimingSummary || "-"}</p>
      </article>
      <article className="section-card">
        <div className="section-title-row">
          <h2>요즘 평은 어때요?</h2>
          <span className={statusClass}>{recentStateLabel || "-"}</span>
        </div>
        <p className="section-body">{recentStateSummary || "-"}</p>
      </article>
      <article className="section-card">
        <h2>이 리포트는 이렇게 봤어요</h2>
        <p className="section-body">반복적으로 관찰된 리뷰 신호를 구매 판단 관점으로 요약했습니다.</p>
        <p className="section-kicker">{generatedAt || "-"}</p>
      </article>
    </section>
  );
}
