import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
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
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [includeFreeGames, setIncludeFreeGames] = useState(true);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");

  const rows = useMemo(() => {
    const raw = Array.isArray(result?.results) ? result.results : [];
    if (includeFreeGames) return raw;
    return raw.filter((item) => item?.is_free !== true);
  }, [result, includeFreeGames]);

  const sortedRows = useMemo(() => {
    return rows
      .map((row, idx) => ({ row, idx }))
      .sort((a, b) => {
        const byConfidence = confidenceRank(b.row) - confidenceRank(a.row);
        if (byConfidence !== 0) return byConfidence;
        return a.idx - b.idx;
      })
      .map((x) => x.row);
  }, [rows]);

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
  }, [likedInput, likedGames, dislikedGames]);

  useEffect(() => {
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
  }, [dislikedInput, likedGames, dislikedGames]);

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
    setSelectedKey("");

    try {
      const trimmed = query.trim();
      if (!trimmed && likedGames.length === 0) {
        setErrorMsg("질문 또는 재밌었던 게임을 최소 1개 이상 입력해 주세요.");
        setStatusLine("");
        return;
      }

      const likedAppIds = likedGames
        .map((item) => Number(item?.appId))
        .filter((value) => Number.isFinite(value) && value > 0);
      const dislikedAppIds = dislikedGames
        .map((item) => Number(item?.appId))
        .filter((value) => Number.isFinite(value) && value > 0);
      const playedAppIds = [...new Set([...likedAppIds, ...dislikedAppIds])];
      const playedGameNames = [
        ...new Set(
          [...likedGames, ...dislikedGames]
            .map((item) => String(item?.label || "").trim())
            .filter(Boolean)
        ),
      ];

      setStatusLine("추천 결과를 불러오는 중입니다...");
      const data = await fetchRecommendations(trimmed, FIXED_TOP_K, {
        playedGames: playedGameNames,
        playedAppIds,
        likedGames: likedAppIds,
        dislikedGames: dislikedAppIds,
        includeFreeGames,
      });
      setResult(data);
      setSubmittedQuery(trimmed);
      setStatusLine("");
      setIsControlsCollapsed(true);
    } catch (err) {
      setErrorMsg(err?.message || "추천 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setStatusLine("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recommend-shell">
      <header className="recommend-topbar">
        <div className="brand-block">
          <p className="brand">Steam Recommender</p>
          <p className="brand-subtitle">자연어 질의와 취향 기반으로 추천을 제공합니다</p>
        </div>
        <div className="topbar-actions">
          <button className="report-back-btn" onClick={() => navigate("/")}>메인으로</button>
        </div>
      </header>

      <section className="section-card recommend-mode-card">
        <div className="section-title-row">
          <h2>추천 입력</h2>
          {result && (
            <div className="recommend-inline-toggle-wrap">
              {isControlsCollapsed && (
                <span className="recommend-inline-toggle-hint">
                  검색창이 숨겨져 있어요
                </span>
              )}
              <button
                type="button"
                className={`recommend-query-tools-btn recommend-inline-toggle-btn ${
                  isControlsCollapsed ? "is-emphasis" : ""
                }`}
                onClick={() => setIsControlsCollapsed((prev) => !prev)}
              >
                {isControlsCollapsed ? "검색 패널 펼치기" : "검색 패널 접기"}
              </button>
            </div>
          )}
        </div>
      </section>

      {!isControlsCollapsed && (
        <form className="section-card recommend-form is-preference" onSubmit={handleSubmit}>
          <>
          <div className="recommend-search-box">
            <input
              className="recommend-search-input"
              type="text"
              aria-label="게임 추천 요청 입력"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="예: 힐링되는 싱글 RPG 추천해줘. 공포는 제외"
              disabled={loading}
            />
          </div>
            <label className="recommend-option-check">
              <input
                type="checkbox"
                checked={includeFreeGames}
                onChange={(e) => setIncludeFreeGames(e.target.checked)}
                disabled={loading}
              />
              무료 게임 포함
            </label>
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
              {loading ? "검색 중..." : "추천 받기"}
            </button>
          </>
        </form>
      )}

      {(statusLine || errorMsg) && (
        <section className="recommend-summary">
          {statusLine && <p className="recommend-status">{statusLine}</p>}
          {errorMsg && <p className="recommend-empty">{errorMsg}</p>}
        </section>
      )}

      {result && submittedQuery && (
        <section className="section-card">
          <h2 className="recommend-card-name">입력한 질문</h2>
          <p className="recommend-card-reason">{submittedQuery}</p>
        </section>
      )}

      {result && commonGenres.length > 0 && (
        <section className="section-card">
          <h2 className="recommend-card-name">공통 장르</h2>
          <div className="recommend-card-tags">
            {commonGenres.map((genre) => (
              <span key={`common-genre-${genre}`} className="recommend-tag">{genre}</span>
            ))}
          </div>
        </section>
      )}

      {result && sortedRows.length === 0 && (
        <p className="recommend-empty">{result.empty_reason || "추천 결과가 없습니다. 다른 입력으로 시도해보세요."}</p>
      )}

      {sortedRows.length > 0 && (
        <section className="section-card">
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
        <section className="section-card">
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
