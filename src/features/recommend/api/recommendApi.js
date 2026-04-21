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

export async function fetchRecommendations(query, topK = 5) {
  return postJson(
    "/api/recommend",
    { query, top_k: topK },
    "추천 결과를 불러오지 못했습니다."
  );
}
