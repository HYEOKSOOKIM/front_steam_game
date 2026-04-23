import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDemoGames, fetchReport } from "../api/reportApi";
import DecisionGrid from "../components/DecisionGrid";
import EvidenceSection from "../components/EvidenceSection";
import FitGrid from "../components/FitGrid";
import GameIntroSection from "../components/GameIntroSection";
import InsufficientReviewState from "../components/InsufficientReviewState";
import ReviewTrendChart from "../components/ReviewTrendChart";
import StatusFooter from "../components/StatusFooter";
import StrengthRiskSection from "../components/StrengthRiskSection";
import Topbar from "../components/Topbar";
import {
  buyBadgeClass,
  normalizeEvidenceSections,
  recommendationLabel,
  recentStateLabel,
  recentStateTone,
  toList,
} from "../utils/reportMappers";

const SUGGESTION_LIMIT = 8;
const DEFAULT_MIN_REPORT_REVIEW_COUNT = 100;
const REPORT_NOT_FOUND_MESSAGE =
  "리포트를 찾지 못했어요\n입력한 게임 이름을 다시 확인하거나, 다른 게임으로 검색해보세요.";

function normalizeSearchText(value) {
  return String(value || "").trim().toLowerCase();
}

function gameLabel(game) {
  if (!game) {
    return "";
  }
  return `${game.name} (${game.appid})`;
}

function findGameByQuery(games, query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return null;
  }

  const exactAppid = games.find((game) => String(game.appid) === normalized);
  if (exactAppid) {
    return exactAppid;
  }

  const exactName = games.find((game) => normalizeSearchText(game.name) === normalized);
  if (exactName) {
    return exactName;
  }

  return games.find((game) => {
    const name = normalizeSearchText(game.name);
    const appid = String(game.appid);
    return name.includes(normalized) || appid.includes(normalized);
  }) || null;
}

function filterGames(games, query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return [];
  }

  return games
    .filter((game) => {
      const name = normalizeSearchText(game.name);
      const appid = String(game.appid);
      return name.includes(normalized) || appid.includes(normalized);
    })
    .slice(0, SUGGESTION_LIMIT);
}

function SearchLanding({
  games,
  query,
  onQueryChange,
  onSubmit,
  onSelectGame,
  suggestions,
  showSuggestions,
  onFocus,
  onBlur,
  loading,
  statusLine,
}) {
  return (
    <section className="report-search-home">
      <p className="report-search-kicker">Steam Report</p>
      <h1 className="report-search-title">어떤 게임이 궁금하세요?</h1>
      <p className="report-search-subtitle">
        한국 유저 리뷰를 바탕으로, 게임의 장단점을 한눈에 정리해드려요
      </p>

      <form className="report-search-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="report-search-input">
          게임명 또는 appid
        </label>
        <div className="report-search-box">
          <input
            id="report-search-input"
            className="report-search-input"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder="예: Elden Ring, GTA V"
            autoComplete="off"
            disabled={loading || games.length === 0}
          />
          <button className="report-search-submit" type="submit" disabled={loading || games.length === 0}>
            검색
          </button>
        </div>
        <p className="report-search-helper">한국어 리뷰만을 기반으로 분석해요</p>

        {showSuggestions ? (
          <div className="report-suggestions" role="listbox" aria-label="검색 제안">
            {suggestions.map((game) => (
              <button
                key={game.appid}
                className="report-suggestion"
                type="button"
                role="option"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelectGame(game)}
              >
                <span>{game.name}</span>
                <strong>{game.appid}</strong>
              </button>
            ))}
          </div>
        ) : null}
      </form>

      {statusLine ? (
        <p className="report-search-status">
          {String(statusLine)
            .split("\n")
            .map((line) => (
              <span key={line}>{line}</span>
            ))}
        </p>
      ) : null}
    </section>
  );
}

export default function ReportPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [report, setReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [statusLine, setStatusLine] = useState("게임 목록을 준비하는 중입니다...");

  const suggestions = useMemo(() => filterGames(games, searchQuery), [games, searchQuery]);
  const showSuggestions = isSearchFocused && suggestions.length > 0 && !report;

  const openReport = useCallback(async (appidValue) => {
    const numericAppid = Number(appidValue);
    if (!numericAppid) {
      setStatusLine("게임 이름을 먼저 입력해주세요");
      return;
    }

    setIsLoadingReport(true);
    setStatusLine("유저 리뷰를 분석하고 있어요");
    try {
      const payload = await fetchReport(numericAppid);
      setReport(payload);
      setStatusLine("리포트를 불러왔습니다.");
    } catch (error) {
      setReport(null);
      if (String(error?.message || "").includes("enabled for demo serving")) {
        setStatusLine(REPORT_NOT_FOUND_MESSAGE);
      } else {
        setStatusLine(error?.message || REPORT_NOT_FOUND_MESSAGE);
      }
    } finally {
      setIsLoadingReport(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function bootstrap() {
      setStatusLine("게임 목록을 준비하는 중입니다...");
      try {
        const loadedGames = await fetchDemoGames();
        if (isCancelled) {
          return;
        }

        setGames(loadedGames);
        setStatusLine(loadedGames.length === 0 ? "표시 가능한 리포트가 없습니다." : "");
      } catch (error) {
        if (!isCancelled) {
          setStatusLine(error?.message || "초기화에 실패했습니다.");
        }
      }
    }

    bootstrap();
    return () => {
      isCancelled = true;
    };
  }, []);

  const display = report?.report_display ?? {};
  const game = report?.game ?? {};
  const recommendation = display.buy_recommendation || "";
  const recentState = display.recent_state || {};
  const evidenceSections = useMemo(() => normalizeEvidenceSections(report), [report]);

  const badgeClass = `buy-badge ${buyBadgeClass(recommendation)}`;
  const goodFor = toList(display.good_for);
  const notGoodFor = toList(display.not_good_for);
  const topStrengths = toList(display.top_strengths);
  const topRisks = toList(display.top_risks);
  const minReportReviewCount =
    Number(report?.min_report_review_count) || DEFAULT_MIN_REPORT_REVIEW_COUNT;
  const sourceReviewCount = Number(report?.source_review_count || 0);
  const isInsufficientReviewReport =
    report?.report_state === "insufficient_reviews" ||
    sourceReviewCount < minReportReviewCount;

  async function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setStatusLine("게임 이름을 먼저 입력해주세요");
      return;
    }

    const numericAppid = Number(trimmed);
    if (Number.isFinite(numericAppid) && numericAppid > 0) {
      await openReport(numericAppid);
      return;
    }

    const matchedGame = findGameByQuery(games, trimmed);
    if (!matchedGame) {
      setStatusLine(REPORT_NOT_FOUND_MESSAGE);
      return;
    }

    setSearchQuery(gameLabel(matchedGame));
    await openReport(matchedGame.appid);
  }

  async function handleSelectGame(game) {
    setSearchQuery(gameLabel(game));
    setIsSearchFocused(false);
    await openReport(game.appid);
  }

  function handleResetSearch() {
    setReport(null);
    setSearchQuery("");
    setStatusLine("");
  }

  return (
    <main className={report ? "report-shell" : "report-shell report-shell-search"}>
      <Topbar
        onBackHome={() => navigate("/")}
        onResetSearch={handleResetSearch}
        showResetSearch={Boolean(report)}
      />

      {!report ? (
        <SearchLanding
          games={games}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          onSelectGame={handleSelectGame}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          loading={isLoadingReport}
          statusLine={statusLine}
        />
      ) : (
        <>
          <GameIntroSection
            appid={report?.appid}
            game={game}
            sourceReviewCount={report?.source_review_count}
            minReviewCount={minReportReviewCount}
          />

          {isInsufficientReviewReport ? (
            <InsufficientReviewState minReviewCount={minReportReviewCount} />
          ) : (
            <>
              <section className="hero-card">
                <div className="hero-meta">
                  <p className="game-title">한눈에 보는 결론</p>
                </div>
                <h1 className="headline">
                  {display.headline || "많은 리뷰의 반복 신호를 바탕으로 구매 결정을 빠르게 정리합니다."}
                </h1>
              </section>

              <section className="section-card review-trend-card">
                <h2>월별 한국어 리뷰 긍정 비율</h2>
                <ReviewTrendChart trend={report?.review_trend} />
              </section>

              <DecisionGrid
                buyTimingSummary={display.buy_timing_summary}
                recommendationBadgeClass={badgeClass}
                recommendationLabel={recommendationLabel(recommendation)}
                recentStateSummary={recentState.summary}
                recentStateLabel={recentStateLabel(recentState.status)}
                recentStateTone={recentStateTone(recentState.status)}
              />

              <FitGrid goodFor={goodFor} notGoodFor={notGoodFor} />

              <StrengthRiskSection strengths={topStrengths} risks={topRisks} />

              <EvidenceSection
                positiveBlocks={evidenceSections.loved}
                negativeBlocks={evidenceSections.complained}
              />
            </>
          )}

          <StatusFooter />
        </>
      )}
    </main>
  );
}
