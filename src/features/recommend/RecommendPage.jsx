import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRecommendations } from "./api/recommendApi";
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

export default function RecommendPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [statusLine, setStatusLine] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

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

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    const normalizedTopK = normalizeTopK(topK);
    if (!trimmed) {
      setErrorMsg("질문을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setStatusLine("추천 결과를 불러오는 중입니다...");
    setResult(null);
    setActiveCategory("all");

    try {
      const data = await fetchRecommendations(trimmed, normalizedTopK);
      setResult(data);
      setStatusLine("추천 완료");
    } catch (err) {
      setErrorMsg(err?.message || "추천 요청에 실패했습니다.");
      setStatusLine("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recommend-shell">
      <header className="recommend-hero">
        <div>
          <p className="recommend-kicker">Steam Recommender</p>
          <h1 className="recommend-title">취향 기반 게임 추천</h1>
          <p className="recommend-subtitle">원하는 분위기와 장르를 입력하면 리뷰 근거 기반으로 추천을 보여줍니다.</p>
        </div>
        <button className="back-btn" onClick={() => navigate("/")}>메인으로</button>
      </header>

      <form className="recommend-form" onSubmit={handleSubmit}>
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
      </form>

      {(statusLine || errorMsg) && (
        <section className="recommend-summary">
          {statusLine && <p className="recommend-status">{statusLine}</p>}
          {errorMsg && <p className="recommend-empty">{errorMsg}</p>}
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
        <p className="recommend-empty">{result.empty_reason || "추천 결과가 없습니다. 다른 키워드로 시도해보세요."}</p>
      )}

      {sortedRows.length > 0 && (
        <ol className="recommend-list">
          {sortedRows.map((item, idx) => (
            <li key={`${item.app_id}-${idx}`} className="recommend-card">
              <div className="recommend-card-head">
                <div className="recommend-card-rank">#{idx + 1}</div>
                <h2 className="recommend-card-name">{item.display_name || item.name}</h2>
                <span className={`recommend-confidence ${confidenceClass(item)}`}>
                  {item.confidence_ko || item.confidence || "확신도 정보 없음"}
                </span>
              </div>

              <div className="recommend-metrics">
                <div className="metric-box">
                  <span className="label">취향 일치도</span>
                  <strong>{toFixedNumber(item.similarity)}</strong>
                </div>
                <div className="metric-box">
                  <span className="label">최근 리뷰 수</span>
                  <strong>{item.recent_review_count ?? "-"}개</strong>
                </div>
                <div className="metric-box">
                  <span className="label">최근 만족도(1년)</span>
                  <strong>{toPercent(item.positive_ratio_1y)}</strong>
                </div>
                <div className="metric-box">
                  <span className="label">평균 플레이 시간</span>
                  <strong>{item.median_playtime_1y ?? "-"}분</strong>
                </div>
              </div>

              <div className="recommend-card-tags">
                {(item.genres_ko || item.genres || []).map((g) => (
                  <span key={g} className="recommend-tag">{g}</span>
                ))}
              </div>

              {item.categories?.length > 0 && <p className="recommend-meta-line">분류: {item.categories.join(", ")}</p>}

              <p className="recommend-card-reason">
                <strong>추천 이유</strong>
                <br />
                {item.reason_ko || "추천 이유가 아직 생성되지 않았습니다."}
              </p>

              {item.one_liner_ko && (
                <p className="recommend-card-oneliner">
                  <strong>한줄 평:</strong> {item.one_liner_ko}
                </p>
              )}

              {item.evidence_ko?.length > 0 && (
                <div className="recommend-evidence">
                  <p className="recommend-evidence-title">리뷰 근거</p>
                  <ol className="recommend-evidence-list">
                    {item.evidence_ko.map((ev, i) => (
                      <li key={`ev-${i}`}>{ev}</li>
                    ))}
                  </ol>
                </div>
              )}

              {item.steam_url && (
                <a className="recommend-link" href={item.steam_url} target="_blank" rel="noopener noreferrer">
                  스팀 상점에서 보기
                </a>
              )}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}


