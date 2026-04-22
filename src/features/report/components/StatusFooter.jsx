export default function StatusFooter({ disclaimer, statusLine }) {
  return (
    <footer className="report-footer">
      <p className="footer-note" id="disclaimer">
        <span>안내</span>
        {disclaimer || "-"}
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
