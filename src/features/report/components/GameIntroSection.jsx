import { useState } from "react";

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return null;
  }
  return n.toLocaleString("ko-KR");
}

function priceLabel(game) {
  if (game?.is_free) {
    return "무료";
  }

  const labels = {
    paid: "유료",
    free_to_play: "무료",
    unknown: "가격 정보 없음",
  };
  return labels[String(game?.price_model || "unknown")] || "가격 정보 없음";
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
    "Mixed": "복합적",
    "Mostly Negative": "대체로 부정적",
    "Very Negative": "매우 부정적",
    "Overwhelmingly Negative": "압도적으로 부정적",
    "매우 긍정적": "매우 긍정적",
    "대체로 긍정적": "대체로 긍정적",
    "복합적": "복합적",
    "대체로 부정적": "대체로 부정적",
    "매우 부정적": "매우 부정적",
    "압도적으로 긍정적": "압도적으로 긍정적",
    "압도적으로 부정적": "압도적으로 부정적",
  };
  return labels[String(value || "").trim()] || String(value || "").trim();
}

function buildSteamReviewSummary(game) {
  const totalReviews = Number(game?.steam_total_reviews);
  const totalPositive = Number(game?.steam_total_positive);

  if (!Number.isFinite(totalReviews) || totalReviews <= 0 || !Number.isFinite(totalPositive)) {
    return null;
  }

  const positivePercent = Math.round((totalPositive / totalReviews) * 100);
  const scoreLabel = steamReviewScoreLabel(game?.steam_review_score_desc);
  const prefix = scoreLabel ? `${scoreLabel} · ` : "";

  return `${prefix}한국어 리뷰 ${formatNumber(totalReviews)}개 중 ${positivePercent}% 긍정적`;
}

function buildSummary(game, sourceReviewCount, minReviewCount) {
  const sourceCount = Number(sourceReviewCount || 0);
  const minimumCount = Number(minReviewCount || 100);

  if (sourceCount < minimumCount) {
    return "아직 한국어 리뷰 데이터가 충분하지 않아요.";
  }

  const steamReviewSummary = buildSteamReviewSummary(game);
  if (steamReviewSummary) {
    return steamReviewSummary;
  }

  if (game?.short_description) {
    return game.short_description;
  }

  return "한국어 리뷰에서 자주 언급된 장점과 아쉬운 점을 정리했어요.";
}

export default function GameIntroSection({
  appid,
  game,
  sourceReviewCount,
  minReviewCount,
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const genres = Array.isArray(game?.genres) ? game.genres.filter(Boolean).slice(0, 4) : [];
  const imageUrl = game?.header_image || (appid ? `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg` : "");
  const sourceCount = formatNumber(sourceReviewCount);

  return (
    <section className="game-intro-card">
      <div className="game-intro-media">
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
            Steam Report
          </div>
        )}
      </div>

      <div className="game-intro-body">
        <p className="game-intro-kicker">선택한 게임</p>
        <h2 className="game-intro-title">{game?.name || `appid ${appid}`}</h2>
        <p className="game-intro-summary">{buildSummary(game, sourceReviewCount, minReviewCount)}</p>

        {genres.length > 0 ? (
          <div className="game-intro-tags" aria-label="장르">
            {genres.map((genre) => (
              <span className="game-intro-tag" key={genre}>
                {genre}
              </span>
            ))}
          </div>
        ) : null}

        <dl className="game-intro-meta">
          <div>
            <dt>가격</dt>
            <dd>{priceLabel(game)}</dd>
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
      </div>
    </section>
  );
}
