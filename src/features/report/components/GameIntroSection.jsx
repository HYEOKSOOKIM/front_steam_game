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

function buildSummary(game) {
  if (game?.short_description) {
    return game.short_description;
  }

  const genres = Array.isArray(game?.genres) ? game.genres.filter(Boolean).slice(0, 2) : [];
  if (genres.length > 0) {
    return `${genres.join(", ")} 장르의 리뷰 기반 게임 리포트입니다.`;
  }
  return "Steam 리뷰를 바탕으로 게임의 구매 판단 맥락을 정리한 리포트입니다.";
}

export default function GameIntroSection({
  appid,
  game,
  sourceReviewCount,
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
        <p className="game-intro-summary">{buildSummary(game)}</p>

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
