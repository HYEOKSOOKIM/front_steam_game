export function toList(values) {
  return Array.isArray(values) ? values : [];
}

export function recommendationLabel(value) {
  const labels = {
    buy_now: "\uad6c\ub9e4 \ucd94\ucc9c",
    buy_on_sale: "\ud560\uc778 \uad6c\ub9e4 \ucd94\ucc9c",
    wait: "\uc5c5\ub370\uc774\ud2b8 \uad00\ub9dd \ucd94\ucc9c",
    not_recommended: "\ud604\uc7ac \ube44\ucd94\ucc9c",
    free_play_recommended: "\ubb34\ub8cc \ud50c\ub808\uc774 \ucd94\ucc9c",
    play_now: "\uc9c0\uae08 \ud50c\ub808\uc774 \ucd94\ucc9c",
    try_lightly: "\uac00\ubccd\uac8c \uc2dc\uc791\ud574\ubcf4\uae30 \uc88b\uc74c",
  };
  return labels[value] || "-";
}

export function recentStateLabel(value) {
  const labels = {
    improving: "\uc88b\uc544\uc9c0\ub294 \uc911",
    stable: "\uae0d\uc815\uc801",
    declining: "\ub098\uc05c\uc9c0\ub294 \uc911",
    mixed: "\uae0d/\ubd80\uc815 \ud63c\uc7ac",
    insufficient_data: "\ud310\ub2e8 \ubcf4\ub958",
  };
  return labels[value] || "-";
}

export function recentStateTone(value) {
  const tones = {
    improving: "success",
    stable: "success",
    declining: "error",
    mixed: "warning",
    insufficient_data: "neutral",
  };
  return tones[value] || "neutral";
}

export function buyBadgeClass(value) {
  const map = {
    buy_now: "buy-now",
    buy_on_sale: "buy-sale",
    wait: "buy-wait",
    not_recommended: "buy-avoid",
    free_play_recommended: "buy-free",
    play_now: "buy-free",
    try_lightly: "buy-try",
  };
  return map[value] || "neutral";
}

function normalizeSnippetText(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitSnippetSentences(text) {
  return String(text || "")
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?\u3002\uff01\uff1f])\s+/u)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatSnippetForDisplay(snippet) {
  const normalized = normalizeSnippetText(snippet);
  if (!normalized) {
    return "";
  }

  const sentences = splitSnippetSentences(normalized);
  if (sentences.length <= 1) {
    return normalized;
  }

  const lines = [];
  for (let index = 0; index < sentences.length; index += 2) {
    lines.push(sentences.slice(index, index + 2).join(" ").trim());
  }
  return lines.join("\n");
}

function normalizeEvidenceBlock(block) {
  if (!block || typeof block !== "object") {
    return null;
  }

  const title = String(block.title || "").trim().replace(/\s+/g, " ");
  const whyItMatters = String(block.why_it_matters || block.explanation || "")
    .trim()
    .replace(/\s+/g, " ");
  const snippets = toList(block.evidence_snippets)
    .map((snippet) => normalizeSnippetText(snippet))
    .filter(Boolean)
    .slice(0, 3);

  if (!title || !whyItMatters || snippets.length < 2) {
    return null;
  }

  return {
    title,
    whyItMatters,
    evidenceSnippets: snippets,
  };
}

export function normalizeEvidenceSections(report) {
  const sections = report && typeof report === "object" ? report.evidence_sections : null;
  if (!sections || typeof sections !== "object") {
    return { loved: [], complained: [] };
  }

  const strengths = Array.isArray(sections.strengths) ? sections.strengths : [];
  const risks = Array.isArray(sections.risks) ? sections.risks : [];
  return {
    loved: strengths.map(normalizeEvidenceBlock).filter(Boolean).slice(0, 3),
    complained: risks.map(normalizeEvidenceBlock).filter(Boolean).slice(0, 3),
  };
}

export function formatGeneratedAt(generatedAt) {
  if (!generatedAt) {
    return "\uc5c5\ub370\uc774\ud2b8 \uc815\ubcf4 \uc5c6\uc74c";
  }
  return `\uc5c5\ub370\uc774\ud2b8: ${new Date(generatedAt).toLocaleString("ko-KR")}`;
}
