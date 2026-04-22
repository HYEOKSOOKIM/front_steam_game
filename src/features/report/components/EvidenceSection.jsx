import { formatSnippetForDisplay } from "../utils/reportMappers";

function EvidenceColumn({ title, tone, blocks, emptyMessage }) {
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
        <span className={`evidence-tone tone-${tone}`}>{blocks.length}개</span>
      </div>
      <div className="evidence-grid">
        {blocks.length === 0 ? <p className="placeholder">{emptyMessage}</p> : null}
        {blocks.map((block, blockIndex) => (
          <article className="evidence-card" key={`${block.title}-${blockIndex}`}>
            <div className="evidence-card-head">
              <span className="evidence-index">{blockIndex + 1}</span>
              <h3>{block.title || "-"}</h3>
            </div>
            <p className="evidence-why">{block.whyItMatters || "-"}</p>
            <ul className="evidence-snippets" aria-label={`${title} 리뷰 인용`}>
              {block.evidenceSnippets.map((snippet, snippetIndex) => (
                <li key={`${snippet}-${snippetIndex}`}>{formatSnippetForDisplay(snippet)}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </article>
  );
}

export default function EvidenceSection({ positiveBlocks, negativeBlocks }) {
  return (
    <section className="section-card evidence-summary-card">
      <div className="section-title-row">
        <h2>리뷰에서 이렇게 말해요</h2>
        <span className="section-kicker">대표 리뷰 신호</span>
      </div>
      <div className="evidence-sections">
        <EvidenceColumn
          title="좋았다는 리뷰"
          tone="positive"
          blocks={positiveBlocks}
          emptyMessage="표시할 긍정 근거 리뷰가 없습니다."
        />
        <EvidenceColumn
          title="아쉽다는 리뷰"
          tone="negative"
          blocks={negativeBlocks}
          emptyMessage="표시할 리스크 근거 리뷰가 없습니다."
        />
      </div>
    </section>
  );
}
