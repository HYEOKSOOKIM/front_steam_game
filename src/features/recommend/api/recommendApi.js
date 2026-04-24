const BASE = import.meta.env.VITE_API_URL ?? "";

async function postJson(url, body, fallbackMessage) {
  const response = await fetch(`${BASE}${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.detail || fallbackMessage);
  }
  return response.json();
}

export async function fetchRecommendations(query, topK = 5, options = {}) {
  const playedGames = Array.isArray(options.playedGames) ? options.playedGames.filter(Boolean) : [];
  const playedAppIds = Array.isArray(options.playedAppIds)
    ? options.playedAppIds.filter((value) => Number.isFinite(Number(value)))
    : [];

  const payload = { query, top_k: topK };
  if (playedGames.length > 0) payload.played_games = playedGames;
  if (playedAppIds.length > 0) payload.played_app_ids = playedAppIds.map((value) => Number(value));

  return postJson(
    "/api/recommend",
    payload,
    "추천 결과를 불러오지 못했습니다."
  );
}

export async function fetchPreferenceRecommendations(likedGames, dislikedGames, topK = 5) {
  return postJson(
    "/api/recommend/preference",
    {
      liked_games: likedGames,
      disliked_games: dislikedGames,
      top_k: topK,
    },
    "취향 기반 추천 결과를 불러오지 못했습니다."
  );
}

export async function fetchRecommendSuggestions(query, limit = 10, options = {}) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
  });
  const response = await fetch(`${BASE}/api/recommend/suggest?${params.toString()}`, {
    signal: options.signal,
  });
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.detail || "게임 자동완성 결과를 불러오지 못했습니다.");
  }
  return response.json();
}
