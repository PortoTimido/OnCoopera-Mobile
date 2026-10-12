export type ArtigoContentBlock =
  | {
      html: string;
      type: "html";
    }
  | {
      html: string;
      type: "callout";
      variant: "dica" | "pergunta";
    };

const MARKER_PATTERN = /<(p|div|li|h[1-6])\b[^>]*>\s*##(?:\s*(dica|pergunta)\s*##)?\s*<\/\1\s*>|(?:^|\r?\n)\s*##(?:\s*(dica|pergunta)\s*##)?\s*(?=\r?\n|$)/gi;

function hasRenderableContent(html: string) {
  return /<\s*(img|hr|br)\b/i.test(html) || html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}

function getMarkerVariant(match: RegExpExecArray) {
  const value = match[2] ?? match[3];

  return value?.toLocaleLowerCase("pt-BR") as "dica" | "pergunta" | undefined;
}

function pushHtmlBlock(blocks: ArtigoContentBlock[], html: string) {
  if (hasRenderableContent(html)) {
    blocks.push({ html, type: "html" });
  }
}

/**
 * Keeps authored HTML intact while removing the text-only markers used by the
 * backoffice to delimit the native Dica and Pergunta cards.
 */
export function getArtigoContentBlocks(conteudo: unknown): ArtigoContentBlock[] {
  if (typeof conteudo !== "string" || !conteudo.trim()) {
    return [];
  }

  const blocks: ArtigoContentBlock[] = [];
  let cursor = 0;
  let calloutMarkerIndex: number | undefined;
  let calloutStart: number | undefined;
  let calloutVariant: "dica" | "pergunta" | undefined;
  let markerMatch: RegExpExecArray | null;

  MARKER_PATTERN.lastIndex = 0;

  while ((markerMatch = MARKER_PATTERN.exec(conteudo))) {
    const variant = getMarkerVariant(markerMatch);

    if (variant && !calloutVariant) {
      pushHtmlBlock(blocks, conteudo.slice(cursor, markerMatch.index));
      calloutMarkerIndex = markerMatch.index;
      calloutStart = MARKER_PATTERN.lastIndex;
      calloutVariant = variant;
      continue;
    }

    if (!variant && calloutVariant && calloutStart !== undefined) {
      blocks.push({ html: conteudo.slice(calloutStart, markerMatch.index), type: "callout", variant: calloutVariant });
      cursor = MARKER_PATTERN.lastIndex;
      calloutMarkerIndex = undefined;
      calloutStart = undefined;
      calloutVariant = undefined;
    }
  }

  if (calloutVariant && calloutStart !== undefined) {
    // An incomplete marker remains ordinary article content, matching the
    // previous behaviour and avoiding accidental data loss.
    pushHtmlBlock(blocks, conteudo.slice(calloutMarkerIndex));
  } else {
    pushHtmlBlock(blocks, conteudo.slice(cursor));
  }

  return blocks;
}

export function formatArtigoDataPublicacao(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}
