import { useState } from "react";
import { formatSnippetForDisplay } from "../utils/reportMappers";

const COLLAPSED_SNIPPET_COUNT = 2;

const TEXT = {
  positiveEvidence: "\uac15\uc810 \uadfc\uac70",
  negativeEvidence: "\ub9ac\uc2a4\ud06c \uadfc\uac70",
  reviewLabel: "\uc2e4\uc81c \ub9ac\ubdf0",
  evidenceReview: "\uadfc\uac70 \ub9ac\ubdf0",
  collapse: "\uadfc\uac70 \uc811\uae30",
  expandMore: "\uadfc\uac70 \ub354 \ubcf4\uae30",
  expandOriginal: "\uc6d0\ubb38 \ud3bc\uce58\uae30",
  sectionTitle: "\ub9ac\ubdf0\uc5d0\uc11c \uc774\ub807\uac8c \ub9d0\ud574\uc694",
  positiveTitle: "\uc88b\uc558\ub2e4\ub294 \ub9ac\ubdf0",
  negativeTitle: "\uc544\uc27d\ub2e4\ub294 \ub9ac\ubdf0",
  positiveEmpty: "\ud45c\uc2dc\ud560 \uae0d\uc815 \uadfc\uac70 \ub9ac\ubdf0\uac00 \uc5c6\uc5b4\uc694.",
  negativeEmpty: "\ud45c\uc2dc\ud560 \uc544\uc26c\uc6b4 \ub9ac\ubdf0\uac00 \uc5c6\uc5b4\uc694.",
};

function snippetLabel(tone, index) {
  return `${TEXT.reviewLabel} ${index + 1}`;
}

function EvidenceColumn({ title, tone, blocks, emptyMessage, activeKey, onToggleEvidence }) {
  const label = tone === "positive" ? TEXT.positiveEvidence : TEXT.negativeEvidence;
  const classes = [
    "evidence-section",
    `evidence-section-${tone}`,
    tone === "positive" ? "tone-panel-positive" : "tone-panel-negative",
    blocks.length === 0 ? "is-empty" : "",
    blocks.length === 1 ? "is-single" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <div className="evidence-section-head">
        <div className="mock-report-card__label">{label}</div>
        <h3 className="evidence-section-title">{title}</h3>
      </div>
      <div className="evidence-grid">
        {blocks.length === 0 ? <p className="placeholder">{emptyMessage}</p> : null}
        {blocks.map((block, blockIndex) => {
          const evidenceKey = `${tone}-${blockIndex}`;
          const isOpen = activeKey === evidenceKey;
          const snippets = Array.isArray(block.evidenceSnippets) ? block.evidenceSnippets : [];
          const visibleSnippets = isOpen ? snippets : snippets.slice(0, COLLAPSED_SNIPPET_COUNT);
          const hasMore = snippets.length > COLLAPSED_SNIPPET_COUNT;

          return (
            <article className={`evidence-card ${isOpen ? "is-open" : ""}`} key={`${block.title}-${blockIndex}`}>
              <div className="evidence-card-trigger">
                <div className="evidence-card-head">
                  <span className="evidence-index">{blockIndex + 1}</span>
                  <div className="evidence-card-heading">
                    <span className="evidence-card-title">{block.title || "-"}</span>
                  </div>
                </div>

                {visibleSnippets.length > 0 ? (
                  <div className="evidence-review-list" aria-label={`${title} ${TEXT.evidenceReview}`}>
                    {visibleSnippets.map((snippet, snippetIndex) => (
                      <figure className="evidence-review-item" key={`${snippet}-${snippetIndex}`}>
                        <figcaption className={`evidence-review-label tone-${tone}`}>
                          {snippetLabel(tone, snippetIndex)}
                        </figcaption>
                        <blockquote className="evidence-review-text">
                          {formatSnippetForDisplay(snippet)}
                        </blockquote>
                      </figure>
                    ))}
                  </div>
                ) : null}

                {snippets.length > 0 ? (
                  <button
                    className="evidence-inline-link"
                    type="button"
                    onClick={() => onToggleEvidence(isOpen ? null : evidenceKey)}
                    aria-expanded={isOpen}
                  >
                    {isOpen ? TEXT.collapse : hasMore ? TEXT.expandMore : TEXT.expandOriginal}
                  </button>
                ) : null}
              </div>
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
        <h2>{TEXT.sectionTitle}</h2>
      </div>
      <div className="evidence-sections">
        <EvidenceColumn
          title={TEXT.positiveTitle}
          tone="positive"
          blocks={positiveBlocks}
          emptyMessage={TEXT.positiveEmpty}
          activeKey={activeEvidenceKey}
          onToggleEvidence={setActiveEvidenceKey}
        />
        <EvidenceColumn
          title={TEXT.negativeTitle}
          tone="negative"
          blocks={negativeBlocks}
          emptyMessage={TEXT.negativeEmpty}
          activeKey={activeEvidenceKey}
          onToggleEvidence={setActiveEvidenceKey}
        />
      </div>
    </section>
  );
}
