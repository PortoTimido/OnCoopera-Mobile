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

const CONTENT_BLOCK_PATTERN = /<(p|div|li|h[1-6])\b[^>]*>([\s\S]*?)<\/\1\s*>|(?:^|\r?\n)([^\r\n]*)(?=\r?\n|$)/gi;

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"',
};

function hasRenderableContent(html: string) {
  return /<\s*(img|hr|br)\b/i.test(html) || html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").trim().length > 0;
}

function getVisibleText(html: string) {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&(?:amp|apos|gt|lt|nbsp|quot);|&#(?:x[0-9a-f]+|\d+);/gi, (entity) => {
      const namedEntity = HTML_ENTITIES[entity.toLocaleLowerCase("en-US")];

      if (namedEntity) {
        return namedEntity;
      }

      const codePoint = entity.slice(2, -1);
      const isHexadecimal = codePoint.startsWith("x") || codePoint.startsWith("X");
      const value = Number.parseInt(isHexadecimal ? codePoint.slice(1) : codePoint, isHexadecimal ? 16 : 10);

      return Number.isNaN(value) || value < 0 || value > 0x10ffff ? entity : String.fromCodePoint(value);
    })
    .replace(/\s+/g, " ")
    .trim();
}

function getMarkerVariant(content: string) {
  const match = getVisibleText(content).match(/^##\s*(dica|pergunta)\s*##$/i);

  if (!match) {
    return undefined;
  }

  return match[1].toLocaleLowerCase("pt-BR") as "dica" | "pergunta";
}

function isCalloutEnd(content: string) {
  return /^##\s*$/.test(getVisibleText(content));
}

function pushHtmlBlock(blocks: ArtigoContentBlock[], html: string) {
  if (hasRenderableContent(html)) {
    blocks.push({ html, type: "html" });
  }
}

/**
 * Keeps authored HTML intact while removing standalone visible-text markers
 * used by the backoffice to delimit the native Dica and Pergunta cards.
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

  CONTENT_BLOCK_PATTERN.lastIndex = 0;

  while ((markerMatch = CONTENT_BLOCK_PATTERN.exec(conteudo))) {
    const markerContent = markerMatch[2] ?? markerMatch[3];
    const variant = getMarkerVariant(markerContent);

    if (variant && !calloutVariant) {
      pushHtmlBlock(blocks, conteudo.slice(cursor, markerMatch.index));
      calloutMarkerIndex = markerMatch.index;
      calloutStart = CONTENT_BLOCK_PATTERN.lastIndex;
      calloutVariant = variant;
      continue;
    }

    if (!variant && calloutVariant && calloutStart !== undefined && isCalloutEnd(markerContent)) {
      blocks.push({ html: conteudo.slice(calloutStart, markerMatch.index), type: "callout", variant: calloutVariant });
      cursor = CONTENT_BLOCK_PATTERN.lastIndex;
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
