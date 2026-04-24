import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fetchRecommendSuggestions } from "../api/recommendApi";

function getSuggestLabel(item) {
  return item?.name_ko || item?.name_en || item?.name || String(item?.app_id || "");
}

function normalizeLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function toPlayedItem(item) {
  const appId = String(item?.app_id ?? item?.appId ?? "");
  const label = String(item?.label || getSuggestLabel(item) || "").trim();
  if (!label) return null;
  return { appId, label };
}

function isDuplicate(existingItems, candidate) {
  const targetLabel = normalizeLabel(candidate.label);
  return existingItems.some((item) => {
    if (candidate.appId && item.appId && String(item.appId) === String(candidate.appId)) {
      return true;
    }
    return normalizeLabel(item.label) === targetLabel;
  });
}

export default function PlayedGamesAutocomplete({ items, onChange, className = "" }) {
  const listboxId = useId();
  const inputRef = useRef(null);
  const requestSeqRef = useRef(0);

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const hasInput = inputValue.trim().length >= 1;
  const activeDescendant =
    isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((item) => {
      const candidate = toPlayedItem(item);
      if (!candidate) return false;
      return !isDuplicate(items, candidate);
    });
  }, [items, suggestions]);

  useEffect(() => {
    const keyword = inputValue.trim();
    if (keyword.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const seq = requestSeqRef.current + 1;
    requestSeqRef.current = seq;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const payload = await fetchRecommendSuggestions(keyword, 10, { signal: controller.signal });
        if (requestSeqRef.current !== seq) return;
        const nextItems = Array.isArray(payload?.items) ? payload.items : [];
        setSuggestions(nextItems);
        setActiveIndex(nextItems.length > 0 ? 0 : -1);
      } catch (error) {
        if (error?.name !== "AbortError" && requestSeqRef.current === seq) {
          setSuggestions([]);
          setActiveIndex(-1);
        }
      } finally {
        if (requestSeqRef.current === seq) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inputValue]);

  useEffect(() => {
    if (activeIndex >= filteredSuggestions.length) {
      setActiveIndex(filteredSuggestions.length > 0 ? 0 : -1);
    }
  }, [activeIndex, filteredSuggestions.length]);

  function addItem(rawItem) {
    const candidate = toPlayedItem(rawItem);
    if (!candidate) return;
    if (isDuplicate(items, candidate)) return;
    onChange([...items, candidate]);
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function removeItem(target) {
    onChange(items.filter((item) => String(item.appId) !== String(target.appId) || item.label !== target.label));
  }

  function clearAll() {
    onChange([]);
    setInputValue("");
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      if (filteredSuggestions.length === 0) return;
      setActiveIndex((prev) => {
        if (prev < 0) return 0;
        return (prev + 1) % filteredSuggestions.length;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) setIsOpen(true);
      if (filteredSuggestions.length === 0) return;
      setActiveIndex((prev) => {
        if (prev < 0) return filteredSuggestions.length - 1;
        return (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (!isOpen || filteredSuggestions.length === 0) return;
      const index = activeIndex >= 0 ? activeIndex : 0;
      addItem(filteredSuggestions[index]);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div
      className={`recommend-chip-field recommend-query-played ${className}`.trim()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <div className="recommend-chip-head">
        <label className="recommend-chip-label" htmlFor="played-games-input">이미 플레이한 게임(추천 제외)</label>
        <button
          type="button"
          className="recommend-chip-clear-btn"
          onClick={clearAll}
          disabled={items.length === 0}
        >
          초기화
        </button>
      </div>
      <p className="recommend-chip-help">게임명을 입력해서 선택하면 추천 결과에서 제외됩니다.</p>

      <div className="recommend-chip-box">
        {items.map((item) => (
          <span key={`played-${item.appId || item.label}`} className="recommend-chip">
            {item.label}
            <button
              type="button"
              onClick={() => removeItem(item)}
              aria-label={`${item.label} 제거`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id="played-games-input"
          ref={inputRef}
          className="recommend-chip-input"
          type="text"
          value={inputValue}
          onChange={(event) => {
            setInputValue(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="예: Hades"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
        />
      </div>

      {isOpen && (isLoading || hasInput || filteredSuggestions.length > 0) && (
        <div className="recommend-suggest-dropdown" role="presentation">
          {isLoading && <p className="recommend-suggest-status">불러오는 중...</p>}
          {!isLoading && hasInput && filteredSuggestions.length === 0 && (
            <p className="recommend-suggest-status">검색 결과 없음</p>
          )}
          {!isLoading && filteredSuggestions.length > 0 && (
            <ul id={listboxId} className="recommend-suggest-list" role="listbox">
              {filteredSuggestions.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li
                    key={`played-suggest-${item.app_id ?? item.name ?? index}`}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <button
                      type="button"
                      className={`recommend-suggest-item ${isActive ? "is-active" : ""}`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => addItem(item)}
                    >
                      <span>{getSuggestLabel(item)}</span>
                      <small>#{item.app_id}</small>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
