import { useState } from "react";

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

function pointPosition(point, index, points, width, height, padding) {
  const xSpan = Math.max(points.length - 1, 1);
  return {
    x: padding.left + ((width - padding.left - padding.right) * index) / xSpan,
    y: padding.top + (height - padding.top - padding.bottom) * (1 - point.positiveRatio),
  };
}

function toChartPath(points, width, height, padding) {
  return points
    .map((point, index) => {
      const { x, y } = pointPosition(point, index, points, width, height, padding);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function formatDelta(value) {
  const percentagePoint = Math.round(Math.abs(value) * 100);
  if (percentagePoint === 0) {
    return "전월과 비슷해요";
  }
  return `전월 대비 ${percentagePoint}%p ${value > 0 ? "상승" : "하락"}`;
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

export default function ReviewTrendChart({ trend }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const points = normalizePoints(trend?.points);
  const width = 560;
  const height = 230;
  const padding = { top: 44, right: 28, bottom: 52, left: 46 };
  const path = toChartPath(points, width, height, padding);
  const latest = points.at(-1);
  const previous = points.at(-2);
  const recentAverage = averagePositiveRatio(points);
  const delta = latest && previous ? latest.positiveRatio - previous.positiveRatio : 0;
  const detailRows = [...points].reverse().slice(0, 3);

  if (points.length < 2) {
    return (
      <div className="review-trend-empty">
        월별 흐름을 그릴 리뷰가 아직 충분하지 않아요.
      </div>
    );
  }

  return (
    <div className="review-trend-chart" aria-label="월별 한국어 리뷰 긍정 비율 그래프">
      <div className="summary-panel review-trend-summary-panel">
        <div>
          <p className="review-trend-summary">
            {formatMonthLabel(latest.label)} · {formatCount(latest.reviewCount)}개 중 {formatPercent(latest.positiveRatio)} 긍정
          </p>
          <p className="review-trend-note">
            {formatDelta(delta)} · 최근 {points.length}개월 평균 {formatPercent(recentAverage)}
          </p>
        </div>
        <button
          className="review-trend-toggle"
          type="button"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((value) => !value)}
        >
          {isExpanded ? "접기" : "자세히 보기"}
        </button>
      </div>

      {isExpanded ? (
        <div className="review-trend-expanded">
          <svg viewBox={`0 0 ${width} ${height}`} role="img">
            <line className="review-trend-grid" x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top} />
            <line className="review-trend-grid" x1={padding.left} y1={(height - padding.bottom + padding.top) / 2} x2={width - padding.right} y2={(height - padding.bottom + padding.top) / 2} />
            <line className="review-trend-grid" x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} />
            <text className="review-trend-axis" x="6" y={padding.top + 4}>100%</text>
            <text className="review-trend-axis" x="14" y={(height - padding.bottom + padding.top) / 2 + 4}>50%</text>
            <text className="review-trend-axis" x="22" y={height - padding.bottom + 4}>0%</text>
            <path className="review-trend-line" d={path} />
            {points.map((point, index) => {
              const { x, y } = pointPosition(point, index, points, width, height, padding);
              return (
                <g key={point.label}>
                  <text className="review-trend-point-label" x={x} y={Math.max(14, y - 12)} textAnchor="middle">
                    {formatPercent(point.positiveRatio)}
                  </text>
                  <circle className="review-trend-dot" cx={x} cy={y} r="4" />
                  <text className="review-trend-month-label" x={x} y={height - 18} textAnchor="middle">
                    {formatMonthLabel(point.label, { compact: true })}
                  </text>
                </g>
              );
            })}
          </svg>

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
