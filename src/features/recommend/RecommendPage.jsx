import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPreferenceRecommendations, fetchRecommendations } from "./api/recommendApi";
import "./styles/recommend.css";

function normalizeTopK(value) {
  const n = Number.parseInt(String(value), 10);
  if (Number.isNaN(n)) return 5;
  return Math.max(1, Math.min(10, n));
}

function toPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const ratio = n <= 1 ? n * 100 : n;
  return `${ratio.toFixed(1)}%`;
}

function toFixedNumber(value, digits = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(digits);
}

function confidenceClass(item) {
  const ko = String(item?.confidence_ko || "");
  const en = String(item?.confidence || "").toLowerCase();
  if (ko.includes("높") || en === "high") return "is-high";
  if (ko.includes("중") || en === "medium") return "is-medium";
  if (ko.includes("낮") || en === "low") return "is-low";
  return "is-unknown";
}

function confidenceRank(item) {
  const ko = String(item?.confidence_ko || "");
  const en = String(item?.confidence || "").toLowerCase();
  if (ko.includes("높") || en === "high") return 3;
  if (ko.includes("중") || en === "medium") return 2;
  if (ko.includes("낮") || en === "low") return 1;
  return 0;
}

function getImageUrl(item) {
  const candidates = [
    item?.image_url,
    item?.header_image,
    item?.capsule_image,
    item?.thumbnail_url,
    item?.cover_url,
    item?.image,
  ];
  return candidates.find((url) => typeof url === "string" && url.trim()) || "";
}

function getItemKey(item, idx = 0) {
  return `${item?.app_id ?? "game"}-${idx}`;
}

function parseChipInput(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function RecommendPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("query");
  const [query, setQuery] = useState("");
  const [likedGames, setLikedGames] = useState([]);
  const [dislikedGames, setDislikedGames] = useState([]);
  const [likedInput, setLikedInput] = useState("");
  const [dislikedInput, setDislikedInput] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedKey, setSelectedKey] = useState("");

  const rows = result?.results || [];
  const tabs = result?.category_tabs || [];
  const resolvedMeta = result?.meta?.resolved || null;

  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) => activeCategory === "all" || (row.categories || []).includes(activeCategory)
    );
  }, [rows, activeCategory]);

  const sortedRows = useMemo(() => {
    return filteredRows
      .map((row, idx) => ({ row, idx }))
      .sort((a, b) => {
        const byConfidence = confidenceRank(b.row) - confidenceRank(a.row);
        if (byConfidence !== 0) return byConfidence;
        return a.idx - b.idx;
      })
      .map((x) => x.row);
  }, [filteredRows]);

  const selectedItem = useMemo(() => {
    if (sortedRows.length === 0) return null;
    const found = sortedRows.find((item, idx) => getItemKey(item, idx) === selectedKey);
    return found || sortedRows[0];
  }, [sortedRows, selectedKey]);

  useEffect(() => {
    if (sortedRows.length === 0) {
      if (selectedKey) setSelectedKey("");
      return;
    }

    const hasSelected = sortedRows.some((item, idx) => getItemKey(item, idx) === selectedKey);
    if (!hasSelected) {
      setSelectedKey(getItemKey(sortedRows[0], 0));
    }
  }, [sortedRows, selectedKey]);

  function resetResultStates() {
    setErrorMsg("");
    setResult(null);
    setStatusLine("");
    setActiveCategory("all");
    setSelectedKey("");
  }

  function addChip(value, target) {
    if (!value.trim()) return;
    const parsed = parseChipInput(value);
    if (parsed.length === 0) return;

    if (target === "liked") {
      setLikedGames((prev) => Array.from(new Set([...prev, ...parsed])));
      setLikedInput("");
    } else {
      setDislikedGames((prev) => Array.from(new Set([...prev, ...parsed])));
      setDislikedInput("");
    }
  }

  function onChipInputKeyDown(e, target) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip(e.currentTarget.value, target);
    }
  }

  function removeChip(target, value) {
    if (target === "liked") {
      setLikedGames((prev) => prev.filter((item) => item !== value));
    } else {
      setDislikedGames((prev) => prev.filter((item) => item !== value));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const normalizedTopK = normalizeTopK(topK);

    setLoading(true);
    setErrorMsg("");
    setResult(null);
    setActiveCategory("all");
    setSelectedKey("");

    try {
      if (mode === "query") {
        const trimmed = query.trim();
        if (!trimmed) {
          setErrorMsg("질문을 입력해 주세요.");
          setStatusLine("");
          return;
        }

        setStatusLine("자연어 추천 결과를 불러오는 중입니다...");
        const data = await fetchRecommendations(trimmed, normalizedTopK);
        setResult(data);
        setStatusLine("자연어 추천 완료");
        return;
      }

      const likedMerged = Array.from(new Set([...likedGames, ...parseChipInput(likedInput)]));
      const dislikedMerged = Array.from(new Set([...dislikedGames, ...parseChipInput(dislikedInput)]));

      setLikedGames(likedMerged);
      setDislikedGames(dislikedMerged);
      setLikedInput("");
      setDislikedInput("");

      if (likedMerged.length === 0) {
        setErrorMsg("좋아하는 게임을 최소 1개 이상 입력해 주세요.");
        setStatusLine("");
        return;
      }

      setStatusLine("취향 기반 추천 결과를 불러오는 중입니다...");
      const data = await fetchPreferenceRecommendations(likedMerged, dislikedMerged, normalizedTopK);
      setResult(data);
      setStatusLine("취향 기반 추천 완료");
    } catch (err) {
      setErrorMsg(err?.message || "추천 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setStatusLine("");
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    resetResultStates();
  }

  return (
    <main className="recommend-shell">
      <header className="recommend-hero">
        <div>
          <p className="recommend-kicker">Steam Recommender</p>
          <h1 className="recommend-title">취향 기반 게임 추천</h1>
          <p className="recommend-subtitle">원하는 분위기와 장르를 입력하거나, 좋아/비선호 게임 기반으로 추천을 받을 수 있습니다.</p>
        </div>
        <button className="back-btn" onClick={() => navigate("/")}>메인으로</button>
      </header>

      <section className="recommend-card">
        <div className="recommend-mode-tabs" role="tablist" aria-label="추천 모드 선택">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "query"}
            className={`recommend-mode-tab ${mode === "query" ? "is-active" : ""}`}
            onClick={() => switchMode("query")}
          >
            자연어 추천
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preference"}
            className={`recommend-mode-tab ${mode === "preference" ? "is-active" : ""}`}
            onClick={() => switchMode("preference")}
          >
            취향 기반 추천
          </button>
        </div>
      </section>

      <form className="recommend-form" onSubmit={handleSubmit}>
        {mode === "query" ? (
          <>
            <input
              className="recommend-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 힐링되는 싱글 RPG 추천해줘. 공포는 제외"
              disabled={loading}
            />
            <input
              className="recommend-input recommend-topk"
              type="number"
              min={1}
              max={10}
              value={topK}
              onChange={(e) => setTopK(e.target.value)}
              disabled={loading}
              aria-label="top-k"
            />
            <button className="recommend-btn" type="submit" disabled={loading || !query.trim()}>
              {loading ? "검색 중..." : "추천 받기"}
            </button>
          </>
        ) : (
          <>
            <div className="recommend-pref-grid">
              <div className="recommend-chip-field">
                <label className="recommend-chip-label">좋아하는 게임</label>
                <div className="recommend-chip-box">
                  {likedGames.map((name) => (
                    <span key={`liked-${name}`} className="recommend-chip">
                      {name}
                      <button type="button" onClick={() => removeChip("liked", name)} aria-label={`${name} 제거`}>×</button>
                    </span>
                  ))}
                  <input
                    className="recommend-chip-input"
                    type="text"
                    value={likedInput}
                    onChange={(e) => setLikedInput(e.target.value)}
                    onKeyDown={(e) => onChipInputKeyDown(e, "liked")}
                    onBlur={(e) => addChip(e.target.value, "liked")}
                    placeholder="게임명 입력 후 Enter 또는 쉼표"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="recommend-chip-field">
                <label className="recommend-chip-label">비선호 게임(선택)</label>
                <div className="recommend-chip-box">
                  {dislikedGames.map((name) => (
                    <span key={`disliked-${name}`} className="recommend-chip is-disliked">
                      {name}
                      <button type="button" onClick={() => removeChip("disliked", name)} aria-label={`${name} 제거`}>×</button>
                    </span>
                  ))}
                  <input
                    className="recommend-chip-input"
                    type="text"
                    value={dislikedInput}
                    onChange={(e) => setDislikedInput(e.target.value)}
                    onKeyDown={(e) => onChipInputKeyDown(e, "disliked")}
                    onBlur={(e) => addChip(e.target.value, "disliked")}
                    placeholder="선택 입력 (Enter 또는 쉼표)"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <input
              className="recommend-input recommend-topk"
              type="number"
              min={1}
              max={10}
              value={topK}
              onChange={(e) => setTopK(e.target.value)}
              disabled={loading}
              aria-label="top-k"
            />
            <button className="recommend-btn" type="submit" disabled={loading}>
              {loading ? "검색 중..." : "취향으로 추천 받기"}
            </button>
          </>
        )}
      </form>

      {(statusLine || errorMsg) && (
        <section className="recommend-summary">
          {statusLine && <p className="recommend-status">{statusLine}</p>}
          {errorMsg && <p className="recommend-empty">{errorMsg}</p>}
        </section>
      )}

      {resolvedMeta && (Array.isArray(resolvedMeta.liked) || Array.isArray(resolvedMeta.disliked)) && (
        <section className="recommend-card">
          <h2 className="recommend-card-name">입력 취향 매칭 결과</h2>
          <div className="recommend-match-grid">
            <div>
              <p className="recommend-meta-line">매칭된 좋아요</p>
              <div className="recommend-card-tags">
                {(resolvedMeta.liked || []).length > 0
                  ? (resolvedMeta.liked || []).map((name) => <span key={`resolved-like-${name}`} className="recommend-tag">{name}</span>)
                  : <span className="recommend-meta-line">없음</span>}
              </div>
            </div>
            <div>
              <p className="recommend-meta-line">매칭된 비선호</p>
              <div className="recommend-card-tags">
                {(resolvedMeta.disliked || []).length > 0
                  ? (resolvedMeta.disliked || []).map((name) => <span key={`resolved-dislike-${name}`} className="recommend-tag">{name}</span>)
                  : <span className="recommend-meta-line">없음</span>}
              </div>
            </div>
          </div>
        </section>
      )}

      {result?.llm_errors?.length > 0 && (
        <section className="recommend-card">
          <h2 className="recommend-card-name">LLM 로그</h2>
          <ol className="recommend-evidence-list">
            {result.llm_errors.map((err, idx) => (
              <li key={`llm-${idx}`}>{err}</li>
            ))}
          </ol>
        </section>
      )}

      {result && (
        <section className="recommend-card">
          <h2 className="recommend-card-name">장르 필터</h2>
          <div className="recommend-filters">
            <button
              type="button"
              className={`recommend-filter ${activeCategory === "all" ? "is-active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              전체
            </button>
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                className={`recommend-filter ${activeCategory === tab.id ? "is-active" : ""}`}
                onClick={() => setActiveCategory(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {result && sortedRows.length === 0 && (
        <p className="recommend-empty">{result.empty_reason || "추천 결과가 없습니다. 다른 입력으로 시도해보세요."}</p>
      )}

      {sortedRows.length > 0 && (
        <section className="recommend-card">
          <h2 className="recommend-card-name">추천 게임 카드</h2>
          <ol className="recommend-poster-list">
            {sortedRows.map((item, idx) => {
              const key = getItemKey(item, idx);
              const imageUrl = getImageUrl(item);
              const isSelected = key === selectedKey || (!selectedKey && idx === 0);
              return (
                <li key={key} className="recommend-poster-item">
                  <button
                    type="button"
                    className={`recommend-poster-button ${isSelected ? "is-active" : ""}`}
                    onClick={() => setSelectedKey(key)}
                  >
                    <span className="recommend-poster-rank">#{idx + 1}</span>
                    <div className="recommend-poster-thumb">
                      {imageUrl ? (
                        <img
                          className="recommend-poster-image"
                          src={imageUrl}
                          alt={`${item.display_name || item.name || "추천 게임"} 포스터`}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="recommend-poster-fallback">NO IMAGE</span>
                      )}
                    </div>
                    <p className="recommend-poster-name">{item.display_name || item.name}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {selectedItem && (
        <section className="recommend-card">
          <div className="recommend-card-head">
            <h2 className="recommend-card-name">{selectedItem.display_name || selectedItem.name}</h2>
            <span className={`recommend-confidence ${confidenceClass(selectedItem)}`}>
              {selectedItem.confidence_ko || selectedItem.confidence || "확신도 정보 없음"}
            </span>
          </div>

          <div className="recommend-metrics">
            <div className="metric-box">
              <span className="label">취향 일치도</span>
              <strong>{toFixedNumber(selectedItem.similarity)}</strong>
            </div>
            <div className="metric-box">
              <span className="label">최근 리뷰 수</span>
              <strong>{selectedItem.recent_review_count ?? "-"}개</strong>
            </div>
            <div className="metric-box">
              <span className="label">최근 만족도(1년)</span>
              <strong>{toPercent(selectedItem.positive_ratio_1y)}</strong>
            </div>
            <div className="metric-box">
              <span className="label">평균 플레이 시간</span>
              <strong>{selectedItem.median_playtime_1y ?? "-"}분</strong>
            </div>
          </div>

          <div className="recommend-card-tags">
            {(selectedItem.genres_ko || selectedItem.genres || []).map((g) => (
              <span key={g} className="recommend-tag">{g}</span>
            ))}
          </div>

          {selectedItem.categories?.length > 0 && <p className="recommend-meta-line">분류: {selectedItem.categories.join(", ")}</p>}

          <p className="recommend-card-reason">
            <strong>추천 이유</strong>
            <br />
            {selectedItem.reason_ko || "추천 이유가 아직 생성되지 않았습니다."}
          </p>

          {selectedItem.one_liner_ko && (
            <p className="recommend-card-oneliner">
              <strong>한줄 평:</strong> {selectedItem.one_liner_ko}
            </p>
          )}

          {selectedItem.evidence_ko?.length > 0 && (
            <div className="recommend-evidence">
              <p className="recommend-evidence-title">리뷰 근거</p>
              <ol className="recommend-evidence-list">
                {selectedItem.evidence_ko.map((ev, i) => (
                  <li key={`ev-${i}`}>{ev}</li>
                ))}
              </ol>
            </div>
          )}

          {selectedItem.steam_url && (
            <a className="recommend-link" href={selectedItem.steam_url} target="_blank" rel="noopener noreferrer">
              스팀 상점에서 보기
            </a>
          )}
        </section>
      )}
    </main>
  );
}
