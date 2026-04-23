const FOOTER_DISCLAIMER =
  "여러 유저 리뷰를 바탕으로 정리했어요. 플레이 경험은 사람마다 다를 수 있어요.";

export default function StatusFooter() {
  return (
    <footer className="report-footer">
      <p className="footer-note" id="disclaimer">
        <span>안내</span>
        {FOOTER_DISCLAIMER}
      </p>
    </footer>
  );
}
