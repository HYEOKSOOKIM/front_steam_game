import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createReportJob, fetchLatestReportV1, fetchReportJob } from "./api/reportApi";
import "./styles/report.css";

const DEFAULT_APP_ID = "2456740";
const ACTIVE_JOB_STATUSES = new Set(["queued", "running"]);

function parseAppId(value) {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

function formatPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const ratio = n <= 1 ? n * 100 : n;
  return `${ratio.toFixed(1)}%`;
}

function formatNumber(value, digits = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(digits);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function decisionLabelText(label) {
  const map = {
    buy_now: "지금 구매",
    buy_on_sale: "할인 시 구매",
    wait: "관망",
    avoid: "비추천",
  };
  return map[label] || label || "-";
}

function jobStatusText(status) {
  const map = {
    queued: "대기 중",
    running: "생성 중",
    succeeded: "완료",
    failed: "실패",
  };
  return map[status] || status || "-";
}

function EmptyListNote({ message }) {
  return <p className="report-empty-note">{message}</p>;
}

function JobStatusPanel({ job, onRefresh, onReload }) {
  if (!job) return null;
  return (
    <section className="report-card report-job-card">
      <div className="report-card-head">
        <h2>생성 작업 상태</h2>
        <span className={`report-badge report-job-${job.status}`}>{jobStatusText(job.status)}</span>
      </div>
      <p className="report-meta">작업 ID: {job.job_id}</p>
      <p className="report-meta">진행률: {job.progress}%</p>
      {job.error_code && <p className="report-state is-error">오류 코드: {job.error_code}</p>}
      {job.error_message && <p className="report-muted">{job.error_message}</p>}
      <div className="report-actions">
        <button type="button" className="report-btn report-btn-ghost" onClick={onRefresh}>
          작업 상태 새로고침
        </button>
        <button type="button" className="report-btn" onClick={onReload}>
          리포트 다시 불러오기
        </button>
      </div>
    </section>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryAppId = searchParams.get("appid");

  const [appIdInput, setAppIdInput] = useState(() => {
    return String(parseAppId(queryAppId) ?? DEFAULT_APP_ID);
  });
  const [report, setReport] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [empty, setEmpty] = useState("");
  const [statusLine, setStatusLine] = useState("");

  const normalizedAppId = useMemo(() => parseAppId(appIdInput), [appIdInput]);

  useEffect(() => {
    const next = parseAppId(queryAppId);
    if (next && String(next) !== appIdInput) {
      setAppIdInput(String(next));
    }
  }, [queryAppId, appIdInput]);

  function persistAppIdParam(appId) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("appid", String(appId));
        return next;
      },
      { replace: true }
    );
  }

  async function loadReportByAppId(appId, options = {}) {
    const { silent = false } = options;
    if (!silent) {
      setLoading(true);
      setError("");
      setEmpty("");
      setStatusLine("리포트를 불러오는 중입니다...");
    }
    try {
      const data = await fetchLatestReportV1(appId);
      setReport(data);
      setStatusLine("리포트를 불러왔습니다.");
      return data;
    } catch (err) {
      const code = err?.errorCode || "";
      const message = err?.message || "리포트를 불러오지 못했습니다.";
      if (code === "analysis_not_ready" || code === "report_not_found") {
        setReport(null);
        setEmpty(message);
        setStatusLine("리포트가 아직 준비되지 않았습니다.");
      } else {
        setError(message);
        setStatusLine("");
      }
      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  async function handleLoadReport() {
    if (!normalizedAppId) {
      setError("유효한 숫자 appid를 입력해 주세요.");
      return;
    }
    persistAppIdParam(normalizedAppId);
    await loadReportByAppId(normalizedAppId);
  }

  async function handleCreateJob() {
    if (!normalizedAppId) {
      setError("유효한 숫자 appid를 입력해 주세요.");
      return;
    }
    setLoading(true);
    setError("");
    setStatusLine("리포트 생성 작업을 요청하는 중입니다...");
    persistAppIdParam(normalizedAppId);
    try {
      const created = await createReportJob({
        appid: normalizedAppId,
        review_pages: "all",
        use_llm_fallback: false,
      });
      setJob(created);
      setStatusLine(created.is_existing ? "기존 활성 작업을 재사용했습니다." : "새 작업을 생성했습니다.");
    } catch (err) {
      setError(err?.message || "리포트 생성 작업 요청에 실패했습니다.");
      setStatusLine("");
    } finally {
      setLoading(false);
    }
  }

  async function refreshJobStatus(options = {}) {
    const { silent = false } = options;
    if (!job?.job_id) return;
    if (!silent) {
      setLoading(true);
      setError("");
      setStatusLine("작업 상태를 확인하는 중입니다...");
    }
    try {
      const refreshed = await fetchReportJob(job.job_id);
      setJob(refreshed);
      setStatusLine(`작업 상태: ${jobStatusText(refreshed.status)}`);

      if (refreshed.status === "succeeded") {
        const appIdFromJob = parseAppId(refreshed?.params?.appid) ?? normalizedAppId;
        if (appIdFromJob) {
          await loadReportByAppId(appIdFromJob, { silent: true });
        }
      }
    } catch (err) {
      if (!silent) {
        setError(err?.message || "작업 상태 조회에 실패했습니다.");
        setStatusLine("");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!job?.job_id || !ACTIVE_JOB_STATUSES.has(String(job.status))) {
      return undefined;
    }
    const timer = setInterval(() => {
      void refreshJobStatus({ silent: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [job?.job_id, job?.status]);

  useEffect(() => {
    const initialAppId = parseAppId(queryAppId);
    if (initialAppId) {
      void loadReportByAppId(initialAppId, { silent: true });
    }
  }, []);

  const snapshot = report?.snapshot || {};
  const dataQuality = report?.data_quality || {};
  const categoryDistribution = report?.category_distribution || [];
  const sentimentByCategory = report?.sentiment_x_category || [];
  const topThemes = report?.top_themes || [];
  const evidenceBlocks = report?.evidence_blocks || [];
  const trend = report?.trend?.summary || {};
  const reviewerSegment = report?.reviewer_segment || [];
  const recommendation = report?.final_recommendation || {};

  return (
    <main className="report-shell">
      <header className="report-hero">
        <div>
          <p className="report-kicker">Steam 리포트 MVP</p>
          <h1 className="report-title">구매 판단 리포트</h1>
          <p className="report-subtitle">구매 신호를 빠르게 스캔할 수 있는 MVP 화면입니다.</p>
        </div>
        <button type="button" className="report-btn report-btn-ghost" onClick={() => navigate("/")}>
          홈으로
        </button>
      </header>

      <section className="report-toolbar report-card">
        <label className="report-input-group">
          <span>앱 ID</span>
          <input
            className="report-input"
            value={appIdInput}
            onChange={(e) => setAppIdInput(e.target.value)}
            placeholder="예: 2456740"
            inputMode="numeric"
          />
        </label>
        <div className="report-actions">
          <button type="button" className="report-btn" onClick={handleLoadReport} disabled={loading}>
            {loading ? "처리 중..." : "리포트 불러오기"}
          </button>
          <button type="button" className="report-btn report-btn-ghost" onClick={handleCreateJob} disabled={loading}>
            작업 생성
          </button>
        </div>
      </section>

      {statusLine && <p className="report-state is-info">{statusLine}</p>}
      {error && <p className="report-state is-error">{error}</p>}
      {!error && empty && <p className="report-state is-empty">{empty}</p>}

      <JobStatusPanel job={job} onRefresh={() => refreshJobStatus()} onReload={handleLoadReport} />

      {!report && !loading && !error ? (
        <section className="report-card">
          <h2>리포트가 없습니다</h2>
          <p className="report-muted">작업을 생성하고 상태를 새로고침한 뒤 리포트를 다시 불러오세요.</p>
        </section>
      ) : null}

      {report ? (
        <>
          <section className="report-grid report-grid-two">
            <article className="report-card">
              <div className="report-card-head">
                <h2>스냅샷</h2>
                <span className="report-badge">{decisionLabelText(snapshot.decision_label)}</span>
              </div>
              <div className="report-metrics">
                <div className="report-metric">
                  <span>판단 점수</span>
                  <strong>{formatNumber(snapshot.decision_score, 1)}</strong>
                </div>
                <div className="report-metric">
                  <span>신뢰도</span>
                  <strong>{formatNumber(snapshot.decision_confidence, 1)}</strong>
                </div>
              </div>
              {Array.isArray(snapshot.key_drivers) && snapshot.key_drivers.length > 0 ? (
                <ul className="report-list">
                  {snapshot.key_drivers.map((driver, idx) => (
                    <li key={`driver-${idx}`}>
                      <span className="report-chip">{driver.type}</span> {driver.category} ({formatNumber(driver.strength, 3)})
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyListNote message="핵심 요인이 없습니다." />
              )}
            </article>

            <article className="report-card">
              <h2>데이터 품질</h2>
              <div className="report-metrics">
                <div className="report-metric">
                  <span>전체 리뷰 수</span>
                  <strong>{dataQuality.review_count_total ?? "-"}</strong>
                </div>
                <div className="report-metric">
                  <span>분석 대상 리뷰 수</span>
                  <strong>{dataQuality.review_count_eligible ?? "-"}</strong>
                </div>
                <div className="report-metric">
                  <span>스냅샷 시각</span>
                  <strong>{formatDate(report.snapshot_at)}</strong>
                </div>
              </div>
              <p className="report-muted">플래그: {(dataQuality.flags || []).join(", ") || "-"}</p>
            </article>
          </section>

          <section className="report-card">
            <h2>카테고리 분포</h2>
            {categoryDistribution.length === 0 ? (
              <EmptyListNote message="카테고리 분포 데이터가 없습니다." />
            ) : (
              <ul className="report-list">
                {categoryDistribution.map((row) => (
                  <li key={row.category}>
                    {row.category} - 비중 {formatPercent(row.share)} - 언급 {row.mentions}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="report-card">
            <h2>감성 x 카테고리</h2>
            {sentimentByCategory.length === 0 ? (
              <EmptyListNote message="감성/카테고리 데이터가 없습니다." />
            ) : (
              <ul className="report-list">
                {sentimentByCategory.map((row) => (
                  <li key={row.category}>
                    #{row.impact_rank} {row.category} - +{formatPercent(row.positive)} / -{formatPercent(row.negative)} - 순값{" "}
                    {formatNumber(row.net, 3)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="report-grid report-grid-two">
            <article className="report-card">
              <h2>핵심 테마</h2>
              {topThemes.length === 0 ? (
                <EmptyListNote message="핵심 테마 데이터가 없습니다." />
              ) : (
                <ul className="report-list">
                  {topThemes.map((theme) => (
                    <li key={theme.theme_code}>
                      {theme.label} ({theme.category}) - {theme.polarity} - 영향도 {formatNumber(theme.impact, 3)}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="report-card">
              <h2>트렌드</h2>
              <p className="report-muted">방향: {trend.direction || "-"}</p>
              <ul className="report-list">
                <li>up: {trend.up_categories ?? 0}</li>
                <li>down: {trend.down_categories ?? 0}</li>
                <li>flat: {trend.flat_categories ?? 0}</li>
                <li>limited: {trend.limited_categories ?? 0}</li>
              </ul>
            </article>
          </section>

          <section className="report-card">
            <h2>근거 블록</h2>
            {evidenceBlocks.length === 0 ? (
              <EmptyListNote message="근거 블록이 없습니다." />
            ) : (
              <ul className="report-list">
                {evidenceBlocks.map((ev) => (
                  <li key={ev.id}>
                    <p>
                      <span className="report-chip">{ev.category}</span>
                      <span className="report-chip">{ev.polarity}</span>
                    </p>
                    <p className="report-quote">{ev.quote}</p>
                    <p className="report-muted">
                      {ev.review_meta?.created_at || "-"} - 플레이타임 {ev.review_meta?.playtime_minutes ?? 0}분 - 추천수{" "}
                      {ev.review_meta?.votes_up ?? 0}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="report-grid report-grid-two">
            <article className="report-card">
              <h2>플레이어 세그먼트</h2>
              {reviewerSegment.length === 0 ? (
                <EmptyListNote message="플레이어 세그먼트 데이터가 없습니다." />
              ) : (
                <ul className="report-list">
                  {reviewerSegment.map((seg) => (
                    <li key={seg.segment}>
                      {seg.segment_label} - 표본 {seg.sample} - 순값 {formatNumber(seg.net_sentiment, 3)} - 주요 리스크{" "}
                      {seg.top_risk || "-"}
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="report-card">
              <h2>최종 추천</h2>
              <p className="report-reason">{recommendation.reason_summary || "-"}</p>
              <p className="report-muted">라벨: {decisionLabelText(recommendation.label)}</p>
              <p className="report-muted">리스크 지수: {formatNumber(recommendation.inputs?.risk_index, 3)}</p>
              <p className="report-muted">트렌드 방향: {recommendation.inputs?.trend_direction || "-"}</p>
              {(recommendation.conditions_to_buy || []).length > 0 ? (
                <ul className="report-list">
                  {(recommendation.conditions_to_buy || []).map((item, idx) => (
                    <li key={`condition-${idx}`}>{item}</li>
                  ))}
                </ul>
              ) : (
                <EmptyListNote message="구매 조건이 제공되지 않았습니다." />
              )}
            </article>
          </section>
        </>
      ) : null}
    </main>
  );
}
