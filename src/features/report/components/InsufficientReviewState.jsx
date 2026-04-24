export default function InsufficientReviewState({ minReviewCount }) {
  const count = Number(minReviewCount) || 100;

  return (
    <section className="section-card insufficient-review-card">
      <h2>아직 분석할 한국어 리뷰가 부족해요</h2>
      <p className="section-body">
        한국어 리뷰가 {count.toLocaleString("ko-KR")}개 이상 쌓이면 리포트를 만들 수 있어요.
      </p>
    </section>
  );
}
