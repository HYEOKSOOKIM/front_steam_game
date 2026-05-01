import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchRecommendations,
  fetchRecommendSuggestions,
} from "./api/recommendApi";
import Topbar from "../report/components/Topbar";
import "../report/styles/report.css";
import "./styles/recommend.css";

const FIXED_TOP_K = 5;
const LOADING_MESSAGES = [
  "리뷰 바다에서 취향 단서를 낚는 중...",
  "재밌는 후보 게임들 줄 세우는 중...",
  "공포는 멀리 보내고 취향은 가까이 모으는 중...",
  "당신의 다음 인생게임을 찾는 중...",
];

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

function toScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  const score = n <= 1 ? n * 100 : n;
  return `${score.toFixed(1)}점`;
}

function toBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "1" || v === "yes" || v === "y";
  }
  return false;
}

function getKoreanSupport(item) {
  const support = item?.korean_support || item?.language_support || item?.languages || {};

  let interfaceSupported =
    toBool(item?.korean_interface) ||
    toBool(item?.supports_korean_interface) ||
    toBool(support?.interface) ||
    toBool(support?.korean_interface);

  let subtitleSupported =
    toBool(item?.korean_subtitles) ||
    toBool(item?.korean_subtitle) ||
    toBool(item?.supports_korean_subtitles) ||
    toBool(support?.subtitles) ||
    toBool(support?.korean_subtitles);

  let audioSupported =
    toBool(item?.korean_audio) ||
    toBool(item?.supports_korean_audio) ||
    toBool(support?.audio) ||
    toBool(support?.korean_audio);

  const supportedLanguagesText = String(item?.supported_languages || "").toLowerCase();
  if (!interfaceSupported && !subtitleSupported && !audioSupported && supportedLanguagesText.includes("korean")) {
    interfaceSupported = true;
  }

  return {
    interfaceSupported,
    subtitleSupported,
    audioSupported,
    anySupported: interfaceSupported || subtitleSupported || audioSupported,
  };
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

function getDisplayTitle(item) {
  return item?.name_ko || item?.display_name_ko || item?.display_name || item?.name_en || item?.name || "제목 없음";
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
  const [koreanSupportedOnly, setKoreanSupportedOnly] = useState(false);
  const [showPreferenceInputs, setShowPreferenceInputs] = useState(false);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [brokenImageKeys, setBrokenImageKeys] = useState(() => new Set());

  const rows = useMemo(() => {
    const raw = Array.isArray(result?.results) ? result.results : [];
    return raw.filter((item) => {
      if (!includeFreeGames && item?.is_free === true) return false;
      if (koreanSupportedOnly && !getKoreanSupport(item).anySupported) return false;
      return true;
    });
  }, [result, includeFreeGames, koreanSupportedOnly]);

  const sortedRows = useMemo(() => rows, [rows]);

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
    if (!loading) return undefined;
    const timer = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1300);
    return () => clearInterval(timer);
  }, [loading]);

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
      setBrokenImageKeys(new Set());
    } catch (err) {
      setErrorMsg(err?.message || "추천 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      setStatusLine("");
    } finally {
      setLoading(false);
    }
  }

  function handleResetSearch() {
    setResult(null);
    setQuery("");
    setSubmittedQuery("");
    setStatusLine("");
    setErrorMsg("");
    setLikedGames([]);
    setDislikedGames([]);
    setLikedInput("");
    setDislikedInput("");
    setLikedSuggestions([]);
    setDislikedSuggestions([]);
    setShowPreferenceInputs(false);
    setIsControlsCollapsed(false);
    setSelectedKey("");
    setKoreanSupportedOnly(false);
  }

  function handleExpandSearchPanel() {
    setIsControlsCollapsed(false);
  }

  return (
    <main className={result ? "report-shell" : "report-shell report-shell-search"}>
      <Topbar
        onBackHome={() => navigate("/")}
        onResetSearch={handleResetSearch}
        showResetSearch={Boolean(result)}
        brand="Steam Recommender"
        subtitle="질문과 취향 기반으로 게임을 추천해드려요"
        resetLabel="추천 입력 초기화"
        homeLabel="메인으로"
      />

      {loading && (
        <section className="recommend-loading-screen" aria-live="polite">
          <div className="recommend-loading-orb" />
          <p className="recommend-loading-title">결과를 가져오는 중...</p>
          <p className="recommend-loading-message">{LOADING_MESSAGES[loadingMessageIndex]}</p>
        </section>
      )}

      {!result && !loading && !isControlsCollapsed && (
        <section className="report-search-home recommend-search-home-wide" style={{ marginBottom: 0, paddingBottom: 0 }}>
          <p className="report-search-kicker">Steam Recommender</p>
          <h1 className="report-search-title">원하는 게임을 추천받아 보세요</h1>
          <p className="report-search-subtitle">원하는 분위기나 조건을 편하게 질문하면, 그에 맞는 게임을 추천해드려요.</p>
          <form className="report-search-form" onSubmit={handleSubmit}>
            <div className="report-search-box">
              <input
                className="report-search-input"
                type="text"
                aria-label="게임 추천 요청 입력"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 스토리가 좋은 싱글 RPG 게임 추천해줘 근데 공포는 싫어 / 스타듀밸리같은 게임 추천해줘"
                disabled={loading}
              />
              <button className="report-search-submit" type="submit" disabled={loading}>
                {loading ? "검색 중..." : "추천 받기"}
              </button>
            </div>
            <div className="recommend-option-row">
              <label className="recommend-option-check">
                <input
                  type="checkbox"
                  checked={includeFreeGames}
                  onChange={(e) => setIncludeFreeGames(e.target.checked)}
                  disabled={loading}
                />
                무료 게임 포함
              </label>
              <label className="recommend-option-check">
                <input
                  type="checkbox"
                  checked={koreanSupportedOnly}
                  onChange={(e) => setKoreanSupportedOnly(e.target.checked)}
                  disabled={loading}
                />
                한국어 지원 게임만
              </label>
            </div>
            <button
              type="button"
              className="recommend-pref-toggle-btn"
              onClick={() => setShowPreferenceInputs((prev) => !prev)}
              disabled={loading}
            >
              {showPreferenceInputs ? "취향 게임 입력 닫기" : "좋아하는/비선호 게임 입력 열기"}
            </button>
            {showPreferenceInputs && (
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
            )}
            <p className="report-search-helper">질문만 입력해도 추천 가능하며, 취향 게임 입력 시 정확도가 올라갑니다.</p>
          </form>
        </section>
      )}
      {errorMsg && (
        <section className="recommend-summary">
          {errorMsg && <p className="recommend-empty">{errorMsg}</p>}
        </section>
      )}

      {result && submittedQuery && (
        <section className="section-card recommend-summary-question" style={{ marginTop: -10, marginBottom: 0 }}>
          <h2 className="recommend-card-name">입력한 질문</h2>
          <p className="recommend-card-reason">{submittedQuery}</p>
        </section>
      )}

      {result && sortedRows.length === 0 && (
        <p className="recommend-empty">{result.empty_reason || "추천 결과가 없습니다. 다른 입력으로 시도해보세요."}</p>
      )}

      {sortedRows.length > 0 && selectedItem && (
        <section className="section-card recommend-result-layout" style={{ marginTop: -10 }}>
          <aside className="recommend-result-list-pane">
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
                        {imageUrl && !brokenImageKeys.has(key) ? (
                          <img
                            className="recommend-poster-image"
                            src={imageUrl}
                            alt={`${item.display_name || item.name || "추천 게임"} 포스터`}
                            loading="lazy"
                            onError={(e) => {
                              setBrokenImageKeys((prev) => {
                                const next = new Set(prev);
                                next.add(key);
                                return next;
                              });
                            }}
                          />
                        ) : (
                          <span className="recommend-poster-fallback">사진 없음</span>
                        )}
                      </div>
                      <p className="recommend-poster-name">{getDisplayTitle(item)}</p>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <article className="recommend-result-detail-pane">
            <div className="recommend-card-head">
              <h2 className="recommend-card-name">{getDisplayTitle(selectedItem)}</h2>
              {selectedItem.steam_url && (
                <a className="recommend-link recommend-link-inline" href={selectedItem.steam_url} target="_blank" rel="noopener noreferrer">
                  스팀에서 보기
                </a>
              )}
            </div>

            <div className="recommend-metrics">
              <div className="metric-box">
                <span className="label">취향 일치도</span>
                <strong>{toScore(selectedItem.similarity)}</strong>
              </div>
              <div className="metric-box">
                <span className="label">반영된 리뷰 수</span>
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

            <div className="metric-box recommend-korean-support-box">
              <span className="label">한국어 지원</span>
              <strong>
                인터페이스 {getKoreanSupport(selectedItem).interfaceSupported ? "지원" : "미지원"} / 자막{" "}
                {getKoreanSupport(selectedItem).subtitleSupported ? "지원" : "미지원"}
              </strong>
            </div>

            <p className="recommend-evidence-title recommend-subsection-title recommend-reason-title">추천 이유</p>
            <p className="recommend-card-reason">
              {selectedItem.reason_ko || "추천 이유가 아직 생성되지 않았습니다."}
            </p>

            {selectedItem.evidence_ko?.length > 0 && (
              <div className="recommend-evidence">
                <p className="recommend-evidence-title recommend-subsection-title">리뷰 근거</p>
                <ol className="recommend-evidence-list">
                  {selectedItem.evidence_ko.map((ev, i) => (
                    <li key={`ev-${i}`}>{ev}</li>
                  ))}
                </ol>
              </div>
            )}

            <div className="recommend-card-tags-separated">
              <p className="recommend-evidence-title recommend-subsection-title">장르 태그</p>
              <div className="recommend-card-tags">
                {(selectedItem.genres_ko || selectedItem.genres || []).map((g) => (
                  <span key={g} className="recommend-tag">{g}</span>
                ))}
              </div>
            </div>
          </article>
        </section>
      )}

      {result && !loading && !isControlsCollapsed && (
        <section className="section-card recommend-under-result-input">
          <form className="recommend-under-result-form" onSubmit={handleSubmit}>
            <div className="report-search-box">
              <input
                className="report-search-input"
                type="text"
                aria-label="게임 추천 요청 입력"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="예: 스토리가 좋은 싱글 RPG 게임 추천해줘 근데 공포는 싫어 / 스타듀밸리같은 게임 추천해줘"
                disabled={loading}
              />
              <button className="report-search-submit" type="submit" disabled={loading}>
                {loading ? "검색 중..." : "추천 받기"}
              </button>
            </div>
            <div className="recommend-option-row">
              <label className="recommend-option-check">
                <input
                  type="checkbox"
                  checked={includeFreeGames}
                  onChange={(e) => setIncludeFreeGames(e.target.checked)}
                  disabled={loading}
                />
                무료 게임 포함
              </label>
              <label className="recommend-option-check">
                <input
                  type="checkbox"
                  checked={koreanSupportedOnly}
                  onChange={(e) => setKoreanSupportedOnly(e.target.checked)}
                  disabled={loading}
                />
                한국어 지원 게임만
              </label>
            </div>
            <button
              type="button"
              className="recommend-pref-toggle-btn"
              onClick={() => setShowPreferenceInputs((prev) => !prev)}
              disabled={loading}
            >
              {showPreferenceInputs ? "취향 게임 입력 닫기" : "좋아하는/비선호 게임 입력 열기"}
            </button>
            {showPreferenceInputs && (
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
            )}
          </form>
        </section>
      )}

      {result && isControlsCollapsed && (
        <section className="recommend-restart-wrap">
          <button type="button" className="recommend-restart-btn" onClick={handleExpandSearchPanel}>
            다시 검색하기
          </button>
        </section>
      )}
    </main>
  );
}
