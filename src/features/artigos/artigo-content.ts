const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"',
};

function decodeHtmlEntities(value: string) {
  return value.replace(/&amp;|&apos;|&gt;|&lt;|&nbsp;|&quot;/g, (entity) => HTML_ENTITIES[entity] ?? entity);
}

export function getArtigoParagraphs(conteudo: string) {
  return decodeHtmlEntities(conteudo)
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
