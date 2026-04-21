const BASE = import.meta.env.VITE_API_URL ?? "";

async function loadJson(url, fallbackMessage) {
  const response = await fetch(`${BASE}${url}`);
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    throw new Error(errorPayload.detail || fallbackMessage);
  }
  return response.json();
}

export async function fetchDemoGames() {
  const payload = await loadJson("/api/games", "Failed to load game list.");
  const games = Array.isArray(payload?.games) ? payload.games : [];
  return games.filter((item) => item?.report_ready);
}

export async function fetchReport(appid) {
  return loadJson(`/api/games/${appid}/report`, "Failed to load report.");
}
