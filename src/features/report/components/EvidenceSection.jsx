import { useState } from "react";
import { formatSnippetForDisplay } from "../utils/reportMappers";

function EvidenceColumn({ title, tone, blocks, emptyMessage, activeKey, onToggleEvidence }) {
  const classes = [
    "evidence-section",
    blocks.length === 0 ? "is-empty" : "",
    blocks.length === 1 ? "is-single" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="evidence-section-head">
        <h3>{title}</h3>
      </div>
      <div className="evidence-grid">
        {blocks.length === 0 ? <p className="placeholder">{emptyMessage}</p> : null}
        {blocks.map((block, blockIndex) => {
          const evidenceKey = `${tone}-${blockIndex}`;
          const isOpen = activeKey === evidenceKey;

          return (
            <article className={`evidence-card ${isOpen ? "is-open" : ""}`} key={`${block.title}-${blockIndex}`}>
              <div className="evidence-card-trigger">
                <div className="evidence-card-head">
                  <span className="evidence-index">{blockIndex + 1}</span>
                  <div className="evidence-card-heading">
                    <span className="evidence-card-title">{block.title || "-"}</span>
                    <span className="evidence-card-kicker">핵심 근거</span>
                  </div>
                </div>
                <p className="evidence-why">{block.whyItMatters || "-"}</p>
                {block.evidenceSnippets[0] ? (
                  <span className="evidence-preview-quote">
                    {formatSnippetForDisplay(block.evidenceSnippets[0])}
                  </span>
                ) : null}
                <button
                  className="evidence-inline-link"
                  type="button"
                  onClick={() => onToggleEvidence(isOpen ? null : evidenceKey)}
                  aria-expanded={isOpen}
                >
                  {isOpen ? "근거 닫기" : "근거 더 보기"}
                </button>
              </div>

              {isOpen ? (
                <div className="evidence-popover" role="region" aria-label={`${title} 상세 근거`}>
                  <p className={`evidence-popover-kicker tone-${tone}`}>{title}</p>
                  <p className="evidence-popover-label">리뷰 인용</p>
                  <ul className="evidence-snippets evidence-popover-snippets">
                    {block.evidenceSnippets.map((snippet, snippetIndex) => (
                      <li key={`${snippet}-${snippetIndex}`}>{formatSnippetForDisplay(snippet)}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </article>
  );
}

export default function EvidenceSection({ positiveBlocks, negativeBlocks }) {
  const [activeEvidenceKey, setActiveEvidenceKey] = useState(null);

  return (
    <section className="section-card evidence-summary-card">
      <div className="section-title-row">
        <h2>리뷰에서 이렇게 말해요</h2>
      </div>
      <div className="evidence-sections">
        <EvidenceColumn
          title="좋았다는 리뷰"
          tone="positive"
          blocks={positiveBlocks}
          emptyMessage="표시할 긍정 근거 리뷰가 없어요."
          activeKey={activeEvidenceKey}
          onToggleEvidence={setActiveEvidenceKey}
        />
        <EvidenceColumn
          title="아쉽다는 리뷰"
          tone="negative"
          blocks={negativeBlocks}
          emptyMessage="표시할 아쉬운 리뷰가 없어요."
          activeKey={activeEvidenceKey}
          onToggleEvidence={setActiveEvidenceKey}
        />
      </div>
    </section>
  );
}
