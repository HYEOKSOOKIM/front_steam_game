import { useMemo, useState } from "react";
import {
  CartesianGrid,
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
    .filter((point) => point.label && point.reviewCount > 0 && Number.isFinite(point.positiveRatio))
    .slice(-CHART_LIMIT);
}

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("ko-KR");
}

function formatMonthLabel(value, { compact = false } = {}) {
  const [year, month] = String(value || "").split("-");
  if (!year || !month) {
    return value;
  }
  if (compact) {
    return `${Number(month)}월`;
  }
  return `${year}.${month}`;
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

  const values = points.map((point) => Math.round(point.positiveRatio * 100));
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
  return Array.from({ length: tickCount }, (_, index) => Math.round(lower + step * index));
}

function formatDeltaLabel(value) {
  const percentagePoint = Math.round(Math.abs(value || 0) * 100);
  if (percentagePoint === 0) {
    return "전월과 비슷해요";
  }
  return `전월 대비 ${percentagePoint}%p ${value > 0 ? "올랐어요" : "내렸어요"}`;
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
      <span>리뷰 수 {formatCount(point.reviewCount)}개</span>
      <span>{formatDeltaLabel(point.deltaFromPrevious)}</span>
    </div>
  );
}

export default function ReviewTrendChart({ trend }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const points = normalizePoints(trend?.points);
  const chartData = useMemo(
    () =>
      points.map((point, index) => {
        const previous = points[index - 1];
        return {
          ...point,
          compactLabel: formatMonthLabel(point.label, { compact: true }),
          percentValue: Math.round(point.positiveRatio * 100),
          deltaFromPrevious: previous ? point.positiveRatio - previous.positiveRatio : 0,
        };
      }),
    [points],
  );
  const latest = points.at(-1);
  const previous = points.at(-2);
  const recentAverage = averagePositiveRatio(points);
  const delta = latest && previous ? latest.positiveRatio - previous.positiveRatio : 0;
  const detailRows = [...points].reverse().slice(0, 3);
  const yDomain = calculateDomain(points);
  const yTicks = buildTicks(yDomain);

  if (points.length < 2) {
    return <div className="review-trend-empty">월별 흐름을 그릴 만큼 리뷰가 아직 충분하지 않아요.</div>;
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
          <div className="review-trend-summary-stats" aria-label="월별 리뷰 흐름 요약">
            <div className="review-trend-stat">
              <span className="review-trend-stat-label">리뷰 수</span>
              <strong>{formatCount(latest.reviewCount)}개</strong>
            </div>
            <div className="review-trend-stat">
              <span className="review-trend-stat-label">전월 대비</span>
              <strong>{formatDeltaLabel(delta)}</strong>
            </div>
            <div className="review-trend-stat">
              <span className="review-trend-stat-label">최근 평균</span>
              <strong>{formatPercent(recentAverage)}</strong>
            </div>
          </div>
        </div>
        <button
          className="review-trend-toggle"
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? "닫기" : "자세히 보기"}
        </button>
      </div>

      {isExpanded ? (
        <div className="review-trend-expanded">
          <div className="review-trend-plot">
            <div className="review-trend-plot-head">
              <strong>최근 {points.length}개월 한국어 리뷰 기준</strong>
              <span>Y축은 긍정 비율, X축은 월별 흐름이에요</span>
            </div>
            <div className="review-trend-chart-frame">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="var(--comp-card-border)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="compactLabel"
                    tick={{ fill: "var(--sys-color-on-surface-variant)", fontSize: 11 }}
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={yDomain}
                    ticks={yTicks}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fill: "var(--sys-color-on-surface-variant)", fontSize: 11 }}
                    tickMargin={10}
                    tickLine={false}
                    axisLine={false}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--sys-color-outline)", strokeDasharray: "4 4" }}
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="review-trend-detail">
            <p className="review-trend-detail-title">최근 월별 상세</p>
            <div className="review-trend-detail-list">
              {detailRows.map((point) => (
                <div className="review-trend-detail-row" key={point.label}>
                  <span>{formatMonthLabel(point.label)}</span>
                  <strong>{formatPercent(point.positiveRatio)} 긍정</strong>
                  <span>리뷰 {formatCount(point.reviewCount)}개</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
