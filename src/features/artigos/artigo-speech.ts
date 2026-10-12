import { formatArtigoDataPublicacao, getArtigoContentBlocks } from "@/features/artigos/artigo-content";
import type { Artigo } from "@/lib/api/artigos";

const BLOCK_END_PATTERN = /<\/(address|article|aside|blockquote|div|figcaption|footer|h[1-6]|header|li|main|nav|ol|p|section|table|tr|ul)>/gi;
const BLOCK_START_PATTERN = /<(br|hr)\s*\/?>/gi;
const IGNORED_CONTENT_PATTERN = /<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const TECHNICAL_MARKER_PATTERN = /^\s*##(?:\s*(dica|pergunta)\s*##)?\s*$/gim;

const HTML_ENTITIES: Record<string, string> = {
  Aacute: "Á",
  Acirc: "Â",
  Agrave: "À",
  Atilde: "Ã",
  Ccedil: "Ç",
  Eacute: "É",
  Ecirc: "Ê",
  Iacute: "Í",
  Oacute: "Ó",
  Ocirc: "Ô",
  Otilde: "Õ",
  Uacute: "Ú",
  amp: "&",
  aacute: "á",
  acirc: "â",
  agrave: "à",
  apos: "'",
  atilde: "ã",
  bull: "•",
  ccedil: "ç",
  copy: "©",
  eacute: "é",
  ecirc: "ê",
  egrave: "è",
  gt: ">",
  hellip: "…",
  iacute: "í",
  icirc: "î",
  igrave: "ì",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  ndash: "–",
  nbsp: " ",
  oacute: "ó",
  ocirc: "ô",
  ograve: "ò",
  otilde: "õ",
  quot: '"',
  rdquo: "”",
  reg: "®",
  rsquo: "’",
  uacute: "ú",
  ucirc: "û",
  ugrave: "ù",
};

function decodeHtmlEntities(value: string) {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith("#x") || code.startsWith("#X")) {
      const codePoint = Number.parseInt(code.slice(2), 16);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : " ";
    }

    if (code.startsWith("#")) {
      const codePoint = Number.parseInt(code.slice(1), 10);
      return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : " ";
    }

    return HTML_ENTITIES[code] ?? HTML_ENTITIES[code.toLocaleLowerCase("en-US")] ?? entity;
  });
}
function getImageAltText(attributes: string) {
  const match = attributes.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
  const alt = match?.[1] ?? match?.[2] ?? match?.[3];

  return alt?.trim() ? `\n${alt.trim()}\n` : "\n";
}

export function htmlToNarrationSegments(html: unknown) {
  if (typeof html !== "string" || !html.trim()) {
    return [];
  }

  const text = html
    .replace(IGNORED_CONTENT_PATTERN, " ")
    .replace(/<img\b([^>]*)>/gi, (_match, attributes: string) => getImageAltText(attributes))
    .replace(BLOCK_END_PATTERN, "\n")
    .replace(BLOCK_START_PATTERN, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(TECHNICAL_MARKER_PATTERN, " ");

  return decodeHtmlEntities(text)
    .split(/\r?\n/)
    .map((segment) => segment.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function splitLongSegment(segment: string, maxLength: number) {
  if (!Number.isFinite(maxLength) || segment.length <= maxLength) {
    return [segment];
  }

  const chunks: string[] = [];
  let remaining = segment;

  while (remaining.length > maxLength) {
    const candidate = remaining.slice(0, maxLength + 1);
    const breakIndex = Math.max(candidate.lastIndexOf(" "), candidate.lastIndexOf(". "), candidate.lastIndexOf(", "));
    const endIndex = breakIndex > 0 ? breakIndex : maxLength;
    chunks.push(remaining.slice(0, endIndex).trim());
    remaining = remaining.slice(endIndex).trim();
  }

  if (remaining) {
    chunks.push(remaining);
  }

  return chunks;
}

export function buildArtigoNarrationSegments(artigo: Artigo, maxLength: number) {
  const segments: string[] = [];
  const add = (values: Array<string | null | undefined>) => {
    for (const value of values) {
      if (value?.trim()) {
        segments.push(value.trim());
      }
    }
  };

  add([artigo.titulo, artigo.resumo]);

  for (const block of getArtigoContentBlocks(artigo.conteudo)) {
    if (block.type === "callout") {
      add([block.variant === "dica" ? "Dica." : "Pergunta."]);
    }

    add(htmlToNarrationSegments(block.html));
  }

  const dataPublicacao = formatArtigoDataPublicacao(artigo.dataPublicacao);

  if (artigo.autorNome || dataPublicacao) {
    add(["Créditos.", artigo.autorNome ? `Por ${artigo.autorNome}.` : undefined, dataPublicacao ? `Publicado em ${dataPublicacao}.` : undefined]);
  }

  const safeMaxLength = Number.isFinite(maxLength) ? Math.max(1, Math.floor(maxLength)) : Number.POSITIVE_INFINITY;

  return segments.flatMap((segment) => splitLongSegment(segment, safeMaxLength));
}
