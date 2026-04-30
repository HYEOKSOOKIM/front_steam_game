import { useMemo, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CHART_LIMIT = 6;

function normalizePoints(points) {
  return (Array.isArray(points) ? points : [])
    .map((point) => ({
      label: String(point?.month || point?.week || ""),
      reviewCount: Number(point?.review_count || 0),
      positiveRatio: Number(point?.positive_ratio),
    }))
    .filter(
      (point) =>
        point.label && point.reviewCount > 0 && Number.isFinite(point.positiveRatio),
    )
    .slice(-CHART_LIMIT);
}

function getDisplayedPercent(value) {
  return Math.round(Number(value || 0) * 100);
}

function getDisplayedPercentDelta(current, previous) {
  return getDisplayedPercent(current) - getDisplayedPercent(previous);
}

function formatPercent(value) {
  return `${getDisplayedPercent(value)}%`;
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}

function formatCountDelta(value) {
  if (value === null || value === undefined) {
    return "비교 없음";
  }
  const count = Math.abs(value || 0);
  if (count === 0) {
    return "변동 없음";
  }
  return `${value > 0 ? "▲" : "▼"} ${formatCount(count)}개`;
}

function formatMonthLabel(value, { compact = false } = {}) {
  const [year, month] = String(value || "").split("-");
  if (!year || !month) {
    return value;
  }
  if (compact) {
    return `${Number(month)}월`;
  }
  return `${year}년 ${Number(month)}월`;
}

function averagePositiveRatio(points) {
  if (points.length === 0) {
    return null;
  }
  const sum = points.reduce((acc, point) => acc + point.positiveRatio, 0);
  return sum / points.length;
}

function calculateDomain(points) {
  if (points.length === 0) {
    return [0, 100];
  }

  const values = points.map((point) => getDisplayedPercent(point.positiveRatio));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = 5;

  let lower = Math.max(0, Math.floor((minValue - padding) / 5) * 5);
  let upper = Math.min(100, Math.ceil((maxValue + padding) / 5) * 5);

  if (upper - lower < 20) {
    const mid = (upper + lower) / 2;
    lower = Math.max(0, Math.floor((mid - 10) / 5) * 5);
    upper = Math.min(100, Math.ceil((mid + 10) / 5) * 5);
  }

  return [lower, upper];
}

function buildTicks([lower, upper]) {
  const tickCount = 5;
  if (upper <= lower) {
    return [lower];
  }

  const step = (upper - lower) / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, index) =>
    Math.round(lower + step * index),
  );
}

function formatDeltaLabel(value) {
  if (value === null || value === undefined) {
    return "비교 월 없음";
  }
  const percentagePoint = Math.abs(value || 0);
  if (percentagePoint === 0) {
    return "전월과 비슷해요";
  }
  return `전월 대비 ${percentagePoint}%p ${value > 0 ? "올랐어요" : "내렸어요"}`;
}

function formatDeltaCompact(value) {
  if (value === null || value === undefined) {
    return "비교 없음";
  }
  const percentagePoint = Math.abs(value || 0);
  if (percentagePoint === 0) {
    return "변동 없음";
  }
  return `${value > 0 ? "▲" : "▼"} ${percentagePoint}%p`;
}

function formatDeltaSummary(value) {
  if (value === null || value === undefined) {
    return "-";
  }
  const percentagePoint = Math.abs(value || 0);
  if (percentagePoint === 0) {
    return "0%";
  }
  return `${percentagePoint}% ${value > 0 ? "▲" : "▼"}`;
}

function getDeltaToneClass(value) {
  if (value === null || value === undefined) {
    return "is-flat";
  }
  const percentagePoint = Math.abs(value || 0);
  if (percentagePoint === 0) {
    return "is-flat";
  }
  return value > 0 ? "is-up" : "is-down";
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;
  if (!point) {
    return null;
  }

  return (
    <div className="review-trend-tooltip">
      <p className="review-trend-tooltip-label">{formatMonthLabel(label)}</p>
      <strong>긍정 비율 {formatPercent(point.positiveRatio)}</strong>
      <span>
        리뷰 수 {formatCount(point.reviewCount)}개 ({formatCountDelta(point.reviewCountDelta)})
      </span>
      <span>{formatDeltaLabel(point.deltaFromPrevious)}</span>
    </div>
  );
}

export default function ReviewTrendChart({
  trend,
  recentStateLabel,
  recentStateSummary,
  recentStateTone,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const points = normalizePoints(trend?.points);
  const chartData = useMemo(
    () =>
      points.map((point, index) => {
        const previous = points[index - 1];
        return {
          ...point,
          compactLabel: formatMonthLabel(point.label, { compact: true }),
          percentValue: getDisplayedPercent(point.positiveRatio),
          deltaFromPrevious: previous
            ? getDisplayedPercentDelta(point.positiveRatio, previous.positiveRatio)
            : null,
          reviewCountDelta: previous ? point.reviewCount - previous.reviewCount : null,
        };
      }),
    [points],
  );
  const latest = points.at(-1);
  const previous = points.at(-2);
  const recentAverage = averagePositiveRatio(points);
  const delta =
    latest && previous
      ? getDisplayedPercentDelta(latest.positiveRatio, previous.positiveRatio)
      : 0;
  const detailRows = [...chartData].reverse().slice(0, CHART_LIMIT);
  const yDomain = calculateDomain(points);
  const yTicks = buildTicks(yDomain);
  const statusClass = `status-chip status-${recentStateTone || "neutral"}`;

  if (points.length < 2) {
    return (
      <div className="review-trend-empty">
        월별 흐름을 그릴 만큼 리뷰가 아직 충분하지 않아요.
      </div>
    );
  }

  return (
    <div className="review-trend-chart" aria-label="월별 한국어 리뷰 긍정 비율 그래프">
      <div className="summary-panel review-trend-summary-panel">
        <div className="review-trend-summary-content">
          <span className="review-trend-eyebrow">최근 흐름 요약</span>
          <p className="review-trend-summary">
            <strong>{formatMonthLabel(latest.label)}</strong>
            <span>긍정 비율 {formatPercent(latest.positiveRatio)}</span>
          </p>
          <div className="review-trend-summary-body">
            <div className="review-trend-summary-stats" aria-label="월별 리뷰 흐름 요약">
              <div className="review-trend-stat">
                <span className="review-trend-stat-label">리뷰 수</span>
                <strong>{formatCount(latest.reviewCount)}개</strong>
              </div>
              <div className="review-trend-stat">
                <span className="review-trend-stat-label">전월 대비</span>
                <strong
                  className={`review-trend-summary-delta ${getDeltaToneClass(delta)}`}
                >
                  {formatDeltaSummary(delta)}
                </strong>
              </div>
              <div className="review-trend-stat">
                <span className="review-trend-stat-label">최근 6개월 평균</span>
                <strong>{formatPercent(recentAverage)}</strong>
              </div>
            </div>
            <div className="review-trend-recent-state">
              <div className="review-trend-recent-state-head">
                <span className="review-trend-stat-label">최근 평은 어때요?</span>
                <span className={statusClass}>{recentStateLabel || "-"}</span>
              </div>
              <p>{recentStateSummary || "-"}</p>
            </div>
          </div>
        </div>
        <div className="review-trend-summary-footer">
          <button
            className="review-trend-toggle"
            type="button"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((value) => !value)}
          >
            <span
              className={`review-trend-toggle-icon ${isExpanded ? "is-open" : ""}`}
              aria-hidden="true"
            >
              ▾
            </span>
            <span className="review-trend-toggle-copy">
              <strong>{isExpanded ? "접기" : "월별 상세 보기"}</strong>
            </span>
          </button>
        </div>
      </div>

      {isExpanded ? (
        <div className="review-trend-expanded">
          <div className="review-trend-plot">
            <div className="review-trend-plot-head">
              <strong>최근 {points.length}개월 한국어 리뷰 긍정 비율</strong>
            </div>
            <div className="review-trend-chart-frame">
              <span className="review-trend-axis-badge review-trend-axis-badge-y">
                긍정 비율
              </span>
              <span className="review-trend-axis-badge review-trend-axis-badge-x">
                월별 흐름
              </span>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 36, right: 24, left: 24, bottom: 20 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--comp-card-border)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="compactLabel"
                    tick={{ fill: "var(--report-text-strong)", fontSize: 12 }}
                    tickMargin={10}
                    padding={{ left: 72, right: 72 }}
                    tickLine={{
                      stroke:
                        "color-mix(in srgb, var(--sys-color-primary) 30%, transparent)",
                    }}
                    axisLine={{
                      stroke:
                        "color-mix(in srgb, var(--sys-color-primary) 42%, transparent)",
                      strokeWidth: 1.2,
                    }}
                  />
                  <YAxis
                    domain={yDomain}
                    ticks={yTicks}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: "var(--report-text-strong)", fontSize: 12 }}
                    tickMargin={10}
                    tickLine={{
                      stroke:
                        "color-mix(in srgb, var(--sys-color-primary) 30%, transparent)",
                    }}
                    axisLine={{
                      stroke:
                        "color-mix(in srgb, var(--sys-color-primary) 42%, transparent)",
                      strokeWidth: 1.2,
                    }}
                    width={68}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "var(--sys-color-outline)",
                      strokeDasharray: "4 4",
                    }}
                    content={<TrendTooltip />}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentValue"
                    stroke="var(--sys-color-primary)"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "var(--sys-color-primary)",
                      stroke: "var(--comp-card-bg)",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--sys-color-primary)",
                      stroke: "var(--comp-card-bg-strong)",
                      strokeWidth: 2,
                    }}
                  >
                    <LabelList
                      dataKey="percentValue"
                      position="top"
                      offset={14}
                      formatter={(value) => `${value}%`}
                      fill="var(--sys-color-on-surface)"
                      fontSize={13}
                      fontWeight={700}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="review-trend-detail">
            <p className="review-trend-detail-title">최근 월별 상세</p>
            <div className="review-trend-detail-list">
              <div className="review-trend-detail-head" aria-hidden="true">
                <span>월</span>
                <span>리뷰 수</span>
                <span>긍정 비율</span>
                <span>전월 대비</span>
              </div>
              {detailRows.map((point) => (
                <div className="review-trend-detail-row" key={point.label}>
                  <span className="review-trend-detail-period">
                    <strong>{formatMonthLabel(point.label)}</strong>
                  </span>
                  <span className="review-trend-detail-count">
                    <strong>{formatCount(point.reviewCount)}개</strong>
                    <small
                      className={`review-trend-delta ${getDeltaToneClass(
                        point.reviewCountDelta,
                      )}`}
                    >
                      {formatCountDelta(point.reviewCountDelta)}
                    </small>
                  </span>
                  <span className="review-trend-detail-metric">
                    <strong>{formatPercent(point.positiveRatio)}</strong>
                  </span>
                  <span className="review-trend-detail-metric">
                    <span
                      className={`review-trend-delta ${getDeltaToneClass(
                        point.deltaFromPrevious,
                      )}`}
                    >
                      {formatDeltaCompact(point.deltaFromPrevious)}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
