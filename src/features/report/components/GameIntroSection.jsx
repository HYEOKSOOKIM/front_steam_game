import { useState } from "react";

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return n.toLocaleString("ko-KR");
}

function formatPriceValue(value, currency = "KRW") {
  const formatted = formatNumber(value);
  if (!formatted) {
    return null;
  }
  if (String(currency || "").toUpperCase() === "KRW") {
    return `₩${formatted}`;
  }
  return `${formatted} ${currency || ""}`.trim();
}

function priceSummary(game) {
  if (game?.is_free) {
    return {
      primary: "무료",
      secondary: "",
    };
  }

  const currency = game?.price_currency || "KRW";
  const current =
    game?.price_current_formatted || formatPriceValue(game?.price_current, currency);
  const original =
    game?.price_original_formatted || formatPriceValue(game?.price_original, currency);
  const discount = Number(game?.price_discount_percent);

  if (current) {
    const hasDiscount =
      Number.isFinite(discount) && discount > 0 && original && original !== current;
    return {
      primary: `현재 ${current}`,
      secondary: hasDiscount ? `정가 ${original} · -${discount}%` : "",
    };
  }

  const labels = {
    paid: "유료",
    free_to_play: "무료",
    unknown: "가격 정보 없음",
  };
  return {
    primary: labels[String(game?.price_model || "unknown")] || "가격 정보 없음",
    secondary: "",
  };
}

function releaseLabel(game) {
  const labels = {
    released: "출시됨",
    early_access: "얼리 액세스",
    coming_soon: "출시 예정",
    unknown: "출시 정보 없음",
  };
  return labels[String(game?.release_stage || "unknown")] || "출시 정보 없음";
}

function steamReviewScoreLabel(value) {
  const labels = {
    "Overwhelmingly Positive": "압도적으로 긍정적",
    "Very Positive": "매우 긍정적",
    "Mostly Positive": "대체로 긍정적",
    Mixed: "복합적",
    "Mostly Negative": "대체로 부정적",
    "Very Negative": "매우 부정적",
    "Overwhelmingly Negative": "압도적으로 부정적",
    "압도적으로 긍정적": "압도적으로 긍정적",
    "매우 긍정적": "매우 긍정적",
    "대체로 긍정적": "대체로 긍정적",
    "복합적": "복합적",
    "대체로 부정적": "대체로 부정적",
    "매우 부정적": "매우 부정적",
    "압도적으로 부정적": "압도적으로 부정적",
  };
  return labels[String(value || "").trim()] || String(value || "").trim();
}

function reviewToneClass(label) {
  if (!label) {
    return "status-neutral";
  }

  if (label === "대체로 긍정적") {
    return "status-positive-soft";
  }

  if (label === "매우 긍정적") {
    return "status-positive-mid";
  }

  if (label === "압도적으로 긍정적") {
    return "status-positive-strong";
  }

  if (label === "복합적") {
    return "status-warning";
  }

  if (label === "대체로 부정적") {
    return "status-negative-soft";
  }

  if (label === "매우 부정적") {
    return "status-negative-mid";
  }

  if (label === "압도적으로 부정적") {
    return "status-negative-strong";
  }

  return "status-neutral";
}

function buildSteamReviewSummary(game) {
  const totalReviews = Number(game?.steam_total_reviews);
  const totalPositive = Number(game?.steam_total_positive);
  const totalNegativeRaw = Number(game?.steam_total_negative);

  if (
    !Number.isFinite(totalReviews) ||
    totalReviews <= 0 ||
    !Number.isFinite(totalPositive)
  ) {
    return null;
  }

  const totalNegative = Number.isFinite(totalNegativeRaw)
    ? totalNegativeRaw
    : Math.max(totalReviews - totalPositive, 0);
  const positivePercent = Math.round((totalPositive / totalReviews) * 100);
  const scoreLabel = steamReviewScoreLabel(game?.steam_review_score_desc);

  return {
    scoreLabel,
    totalReviews,
    totalPositive,
    totalNegative,
    positivePercent,
    negativePercent: Math.max(100 - positivePercent, 0),
    description: `사용자 평가 ${formatNumber(totalReviews)}개 중 ${positivePercent}%가 긍정적이에요`,
  };
}

function buildFallbackSummary(game, sourceReviewCount, minReviewCount) {
  const sourceCount = Number(sourceReviewCount || 0);
  const minimumCount = Number(minReviewCount || 100);

  if (sourceCount < minimumCount) {
    return "아직 수집된 리뷰 데이터가 충분하지 않아요.";
  }

  if (game?.short_description) {
    return game.short_description;
  }

  return "수집된 리뷰에서 자주 언급된 장점과 주의할 점을 정리했어요.";
}

export default function GameIntroSection({
  appid,
  game,
  sourceReviewCount,
  minReviewCount,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const genres = Array.isArray(game?.genres)
    ? game.genres.filter(Boolean).slice(0, 4)
    : [];
  const imageUrl =
    game?.header_image ||
    (appid
      ? `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`
      : "");
  const sourceCount = formatNumber(sourceReviewCount);
  const steamStoreUrl =
    game?.steam_store_url || (appid ? `https://store.steampowered.com/app/${appid}` : "");
  const steamReviewSummary = buildSteamReviewSummary(game);
  const fallbackSummary = buildFallbackSummary(
    game,
    sourceReviewCount,
    minReviewCount,
  );
  const price = priceSummary(game);

  return (
    <section className="game-intro-card">
      <div className="game-intro-media">
        {steamStoreUrl ? (
          <a
            className="game-intro-store-link"
            href={steamStoreUrl}
            target="_blank"
            rel="noreferrer"
          >
            Steam에서 보기
          </a>
        ) : null}
        {imageUrl && !imageFailed ? (
          <img
            className="game-intro-image"
            src={imageUrl}
            alt={`${game?.name || "게임"} 대표 이미지`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="game-intro-placeholder" aria-label="게임 이미지 없음">
            Steam Review Report
          </div>
        )}
      </div>

      <div className="game-intro-body">
        <p className="game-intro-kicker">선택한 게임</p>
        <div className="game-intro-title-row">
          <h2 className="game-intro-title">{game?.name || `appid ${appid}`}</h2>
          {genres.length > 0 ? (
            <div className="game-intro-title-tags" aria-label="대표 장르">
              {genres.map((genre) => (
                <span className="game-intro-tag" key={genre}>
                  {genre}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="game-intro-overview">
          <dl className="game-intro-meta">
            <div>
              <dt>가격</dt>
              <dd className="game-intro-price">
                <span className="game-intro-price-current">{price.primary}</span>
                {price.secondary ? (
                  <span className="game-intro-price-original">{price.secondary}</span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>상태</dt>
              <dd>{releaseLabel(game)}</dd>
            </div>
            {game?.release_date_text ? (
              <div>
                <dt>출시일</dt>
                <dd>{game.release_date_text}</dd>
              </div>
            ) : null}
            {sourceCount ? (
              <div>
                <dt>수집 리뷰</dt>
                <dd>{sourceCount}개</dd>
              </div>
            ) : null}
          </dl>

          {steamReviewSummary ? (
            <div className="game-intro-review-summary">
              <div className="game-intro-review-copy">
                <p className="game-intro-review-label">한국어 리뷰 반응</p>
                <p className="game-intro-summary">
                  {steamReviewSummary.scoreLabel ? (
                    <span
                      className={`status-chip ${reviewToneClass(
                        steamReviewSummary.scoreLabel,
                      )}`}
                    >
                      {steamReviewSummary.scoreLabel}
                    </span>
                  ) : null}
                  <span>{steamReviewSummary.description}</span>
                </p>

                <div className="game-intro-review-legend" aria-hidden="true">
                  <span className="game-intro-review-legend-item is-positive">
                    긍정 {steamReviewSummary.positivePercent}% ·{" "}
                    {formatNumber(steamReviewSummary.totalPositive)}개
                  </span>
                  <span className="game-intro-review-legend-item is-negative">
                    부정 {steamReviewSummary.negativePercent}% ·{" "}
                    {formatNumber(steamReviewSummary.totalNegative)}개
                  </span>
                </div>
              </div>

              <div className="game-intro-review-visual" aria-label="전체 사용자 평가 비율">
                <div
                  className="game-intro-review-donut"
                  style={{
                    "--positive-angle": `${steamReviewSummary.positivePercent}%`,
                  }}
                >
                  <div className="game-intro-review-donut-center">
                    <strong>{steamReviewSummary.positivePercent}%</strong>
                    <span>긍정</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="game-intro-summary">{fallbackSummary}</p>
          )}
        </div>
      </div>
    </section>
  );
}
