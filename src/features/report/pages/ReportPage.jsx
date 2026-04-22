import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDemoGames, fetchReport } from "../api/reportApi";
import DecisionGrid from "../components/DecisionGrid";
import EvidenceSection from "../components/EvidenceSection";
import FitGrid from "../components/FitGrid";
import StatusFooter from "../components/StatusFooter";
import StrengthRiskSection from "../components/StrengthRiskSection";
import Topbar from "../components/Topbar";
import {
  buyBadgeClass,
  formatGeneratedAt,
  normalizeEvidenceSections,
  recommendationLabel,
  recentStateLabel,
  recentStateTone,
  toList,
} from "../utils/reportMappers";

const SUGGESTION_LIMIT = 8;

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
      <h1 className="report-search-title">게임 리포트 검색</h1>
      <p className="report-search-subtitle">
        게임명을 입력하면 리뷰 기반 게임 리포트를 확인할 수 있습니다
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
            placeholder="게임을 입력해주세요"
            autoComplete="off"
            disabled={loading || games.length === 0}
          />
          <button className="report-search-submit" type="submit" disabled={loading || games.length === 0}>
            {loading ? "불러오는 중..." : "검색"}
          </button>
        </div>

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

      {statusLine ? <p className="report-search-status">{statusLine}</p> : null}
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
      setStatusLine("리포트를 볼 게임을 검색해 주세요.");
      return;
    }

    setIsLoadingReport(true);
    setStatusLine("구매 판단 리포트를 불러오는 중입니다...");
    try {
      const payload = await fetchReport(numericAppid);
      setReport(payload);
      setStatusLine("리포트를 불러왔습니다.");
    } catch (error) {
      setReport(null);
      setStatusLine(error?.message || "리포트 로드에 실패했습니다.");
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
        setStatusLine(
          loadedGames.length === 0
            ? "표시 가능한 리포트가 없습니다."
            : ""
        );
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

  async function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setStatusLine("게임명 또는 appid를 입력해 주세요.");
      return;
    }

    const numericAppid = Number(trimmed);
    if (Number.isFinite(numericAppid) && numericAppid > 0) {
      await openReport(numericAppid);
      return;
    }

    const matchedGame = findGameByQuery(games, trimmed);
    if (!matchedGame) {
      setStatusLine("준비된 리포트 목록에서 일치하는 게임을 찾지 못했습니다.");
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
          <section className="hero-card">
            <div className="hero-meta">
              <p className="game-title">
                {game.name || (report?.appid ? `appid ${report.appid}` : "게임을 선택하면 리포트가 표시됩니다.")}
              </p>
              <span className={badgeClass}>{recommendationLabel(recommendation)}</span>
            </div>
            <h1 className="headline">
              {display.headline || "많은 리뷰의 반복 신호를 바탕으로 구매 결정을 빠르게 정리합니다."}
            </h1>
          </section>

          <DecisionGrid
            buyTimingSummary={display.buy_timing_summary}
            recentStateSummary={recentState.summary}
            recentStateLabel={recentStateLabel(recentState.status)}
            recentStateTone={recentStateTone(recentState.status)}
            generatedAt={formatGeneratedAt(report?.generated_at)}
          />

          <FitGrid goodFor={goodFor} notGoodFor={notGoodFor} />

          <StrengthRiskSection strengths={topStrengths} risks={topRisks} />

          <EvidenceSection
            positiveBlocks={evidenceSections.loved}
            negativeBlocks={evidenceSections.complained}
          />

          <StatusFooter disclaimer={report?.disclaimer} statusLine={statusLine} />
        </>
      )}
    </main>
  );
}
