import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchPreferenceRecommendations,
  fetchRecommendations,
  fetchRecommendSuggestions,
} from "./api/recommendApi";
import "./styles/recommend.css";

const FIXED_TOP_K = 5;

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

function getSuggestLabel(item) {
  return item?.name_ko || item?.name_en || item?.name || String(item?.app_id || "");
}

function includesAppId(items, appId) {
  return items.some((item) => item.appId === appId);
}

export default function RecommendPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("query");
  const [query, setQuery] = useState("");
  const [likedGames, setLikedGames] = useState([]);
  const [dislikedGames, setDislikedGames] = useState([]);
  const [likedInput, setLikedInput] = useState("");
  const [dislikedInput, setDislikedInput] = useState("");
  const [likedSuggestions, setLikedSuggestions] = useState([]);
  const [dislikedSuggestions, setDislikedSuggestions] = useState([]);
  const [likedSuggestLoading, setLikedSuggestLoading] = useState(false);
  const [dislikedSuggestLoading, setDislikedSuggestLoading] = useState(false);
  const [likedSuggestOpen, setLikedSuggestOpen] = useState(false);
  const [dislikedSuggestOpen, setDislikedSuggestOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedKey, setSelectedKey] = useState("");

  const rows = result?.results || [];
  const tabs = result?.category_tabs || [];

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

  const commonGenres = useMemo(() => {
    if (sortedRows.length === 0) return [];

    const counts = new Map();
    sortedRows.forEach((row) => {
      const genres = row?.genres_ko || row?.genres || [];
      genres.forEach((genre) => {
        const key = String(genre || "").trim();
        if (!key) return;
        counts.set(key, (counts.get(key) || 0) + 1);
      });
    });

    const minCount = sortedRows.length === 1 ? 1 : 2;
    return [...counts.entries()]
      .filter(([, count]) => count >= minCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre]) => genre);
  }, [sortedRows]);

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

  useEffect(() => {
    if (mode !== "preference") return;
    const keyword = likedInput.trim();
    if (keyword.length < 1) {
      setLikedSuggestions([]);
      setLikedSuggestLoading(false);
      return;
    }

    let canceled = false;
    const timer = setTimeout(async () => {
      try {
        setLikedSuggestLoading(true);
        const payload = await fetchRecommendSuggestions(keyword, 10);
        if (canceled) return;
        const items = Array.isArray(payload?.items) ? payload.items : [];
        const filtered = items.filter((item) => {
          const appId = String(item?.app_id || "");
          if (!appId) return false;
          if (includesAppId(likedGames, appId)) return false;
          if (includesAppId(dislikedGames, appId)) return false;
          return true;
        });
        setLikedSuggestions(filtered.slice(0, 10));
      } catch {
        if (!canceled) {
          setLikedSuggestions([]);
        }
      } finally {
        if (!canceled) {
          setLikedSuggestLoading(false);
        }
      }
    }, 280);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [likedInput, mode, likedGames, dislikedGames]);

  useEffect(() => {
    if (mode !== "preference") return;
    const keyword = dislikedInput.trim();
    if (keyword.length < 1) {
      setDislikedSuggestions([]);
      setDislikedSuggestLoading(false);
      return;
    }

    let canceled = false;
    const timer = setTimeout(async () => {
      try {
        setDislikedSuggestLoading(true);
        const payload = await fetchRecommendSuggestions(keyword, 10);
        if (canceled) return;
        const items = Array.isArray(payload?.items) ? payload.items : [];
        const filtered = items.filter((item) => {
          const appId = String(item?.app_id || "");
          if (!appId) return false;
          if (includesAppId(dislikedGames, appId)) return false;
          if (includesAppId(likedGames, appId)) return false;
          return true;
        });
        setDislikedSuggestions(filtered.slice(0, 10));
      } catch {
        if (!canceled) {
          setDislikedSuggestions([]);
        }
      } finally {
        if (!canceled) {
          setDislikedSuggestLoading(false);
        }
      }
    }, 280);

    return () => {
      canceled = true;
      clearTimeout(timer);
    };
  }, [dislikedInput, mode, likedGames, dislikedGames]);

  function resetResultStates() {
    setErrorMsg("");
    setResult(null);
    setStatusLine("");
    setActiveCategory("all");
    setSelectedKey("");
  }

  function addGameChip(target, item) {
    const appId = String(item?.app_id ?? item?.appId ?? "");
    const label = item?.label || getSuggestLabel(item);
    if (!appId || !label) return;

    if (includesAppId(likedGames, appId) || includesAppId(dislikedGames, appId)) {
      setErrorMsg("이미 추가된 게임입니다. 좋아요/비선호 중 한쪽에만 등록할 수 있어요.");
      return;
    }

    setErrorMsg("");
    if (target === "liked") {
      setLikedGames((prev) => [...prev, { appId, label }]);
      setLikedInput("");
      setLikedSuggestions([]);
      setLikedSuggestOpen(false);
    } else {
      setDislikedGames((prev) => [...prev, { appId, label }]);
      setDislikedInput("");
      setDislikedSuggestions([]);
      setDislikedSuggestOpen(false);
    }
  }

  function removeChip(target, appId) {
    if (target === "liked") {
      setLikedGames((prev) => prev.filter((item) => item.appId !== appId));
      return;
    }
    setDislikedGames((prev) => prev.filter((item) => item.appId !== appId));
  }

  function onChipInputKeyDown(e, target) {
    if (e.key !== "Enter") return;

    const source = target === "liked" ? likedSuggestions : dislikedSuggestions;
    if (source.length > 0) {
      e.preventDefault();
      addGameChip(target, source[0]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

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
        const data = await fetchRecommendations(trimmed, FIXED_TOP_K);
        setResult(data);
        setStatusLine("자연어 추천 완료");
        return;
      }

      if (likedGames.length === 0) {
        setErrorMsg("좋아하는 게임을 최소 1개 이상 선택해 주세요.");
        setStatusLine("");
        return;
      }

      setStatusLine("취향 기반 추천 결과를 불러오는 중입니다...");
      const data = await fetchPreferenceRecommendations(
        likedGames.map((item) => item.appId),
        dislikedGames.map((item) => item.appId),
        FIXED_TOP_K
      );
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
    setLikedSuggestOpen(false);
    setDislikedSuggestOpen(false);
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

      <form className={`recommend-form ${mode === "query" ? "is-query" : "is-preference"}`} onSubmit={handleSubmit}>
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
            <button className="recommend-btn" type="submit" disabled={loading || !query.trim()}>
              {loading ? "검색 중..." : "추천 받기"}
            </button>
          </>
        ) : (
          <>
            <div className="recommend-pref-grid">
              <div
                className="recommend-chip-field"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setLikedSuggestOpen(false);
                  }
                }}
              >
                <p className="recommend-chip-help">한국어 검색이 안 되면 영어 제목으로 입력해 주세요.</p>
                <label className="recommend-chip-label">좋아하는 게임</label>
                <div className="recommend-chip-box">
                  {likedGames.map((item) => (
                    <span key={`liked-${item.appId}`} className="recommend-chip">
                      {item.label}
                      <button type="button" onClick={() => removeChip("liked", item.appId)} aria-label={`${item.label} 제거`}>×</button>
                    </span>
                  ))}
                  <input
                    className="recommend-chip-input"
                    type="text"
                    value={likedInput}
                    onChange={(e) => setLikedInput(e.target.value)}
                    onKeyDown={(e) => onChipInputKeyDown(e, "liked")}
                    onFocus={() => setLikedSuggestOpen(true)}
                    placeholder="게임명 입력 후 선택"
                    disabled={loading}
                  />
                </div>
                {likedSuggestOpen && (
                  <div className="recommend-suggest-dropdown">
                    {likedSuggestLoading && <p className="recommend-suggest-status">불러오는 중...</p>}
                    {!likedSuggestLoading && likedInput.trim().length >= 1 && likedSuggestions.length === 0 && (
                      <p className="recommend-suggest-status">일치하는 게임 없음</p>
                    )}
                    {!likedSuggestLoading && likedSuggestions.length > 0 && (
                      <ul className="recommend-suggest-list">
                        {likedSuggestions.map((item) => (
                          <li key={`liked-suggest-${item.app_id}`}>
                            <button
                              type="button"
                              className="recommend-suggest-item"
                              onClick={() => addGameChip("liked", item)}
                            >
                              <span>{getSuggestLabel(item)}</span>
                              <small>#{item.app_id}</small>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div
                className="recommend-chip-field"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    setDislikedSuggestOpen(false);
                  }
                }}
              >
                <label className="recommend-chip-label">비선호 게임(선택)</label>
                <div className="recommend-chip-box">
                  {dislikedGames.map((item) => (
                    <span key={`disliked-${item.appId}`} className="recommend-chip is-disliked">
                      {item.label}
                      <button type="button" onClick={() => removeChip("disliked", item.appId)} aria-label={`${item.label} 제거`}>×</button>
                    </span>
                  ))}
                  <input
                    className="recommend-chip-input"
                    type="text"
                    value={dislikedInput}
                    onChange={(e) => setDislikedInput(e.target.value)}
                    onKeyDown={(e) => onChipInputKeyDown(e, "disliked")}
                    onFocus={() => setDislikedSuggestOpen(true)}
                    placeholder="게임명 입력 후 선택"
                    disabled={loading}
                  />
                </div>
                {dislikedSuggestOpen && (
                  <div className="recommend-suggest-dropdown">
                    {dislikedSuggestLoading && <p className="recommend-suggest-status">불러오는 중...</p>}
                    {!dislikedSuggestLoading && dislikedInput.trim().length >= 1 && dislikedSuggestions.length === 0 && (
                      <p className="recommend-suggest-status">일치하는 게임 없음</p>
                    )}
                    {!dislikedSuggestLoading && dislikedSuggestions.length > 0 && (
                      <ul className="recommend-suggest-list">
                        {dislikedSuggestions.map((item) => (
                          <li key={`disliked-suggest-${item.app_id}`}>
                            <button
                              type="button"
                              className="recommend-suggest-item"
                              onClick={() => addGameChip("disliked", item)}
                            >
                              <span>{getSuggestLabel(item)}</span>
                              <small>#{item.app_id}</small>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
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

      {result && commonGenres.length > 0 && (
        <section className="recommend-card">
          <h2 className="recommend-card-name">공통 장르</h2>
          <div className="recommend-card-tags">
            {commonGenres.map((genre) => (
              <span key={`common-genre-${genre}`} className="recommend-tag">{genre}</span>
            ))}
          </div>
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
