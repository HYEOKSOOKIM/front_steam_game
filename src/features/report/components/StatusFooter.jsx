const FOOTER_DISCLAIMER =
  "여러 유저 리뷰를 바탕으로 정리했어요. 플레이 경험은 사람마다 다를 수 있어요.";

export default function StatusFooter({ statusLine }) {
  return (
    <footer className="report-footer">
      <p className="footer-note" id="disclaimer">
        <span>안내</span>
        {FOOTER_DISCLAIMER}
      </p>
      {statusLine ? (
        <p className="footer-note footer-status" id="status-line">
          <span>상태</span>
          {statusLine}
        </p>
      ) : null}
    </footer>
  );
}
