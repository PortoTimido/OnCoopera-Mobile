const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&apos;": "'",
  "&gt;": ">",
  "&lt;": "<",
  "&nbsp;": " ",
  "&quot;": '"',
};

export type ArtigoContentBlock =
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "callout";
      variant: "dica" | "pergunta";
      paragraphs: string[];
    };

function decodeHtmlEntities(value: string) {
  return value.replace(/&amp;|&apos;|&gt;|&lt;|&nbsp;|&quot;/g, (entity) => HTML_ENTITIES[entity] ?? entity);
}

function getArtigoLines(conteudo: string) {
  return decodeHtmlEntities(conteudo)
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => line.trim());
}

function getCalloutVariant(line: string): "dica" | "pergunta" | undefined {
  const match = line.match(/^##\s*(dica|pergunta)\s*##$/i);

  if (!match) {
    return undefined;
  }

  return match[1].toLocaleLowerCase("pt-BR") as "dica" | "pergunta";
}

function isCalloutEnd(line: string) {
  return /^##\s*$/.test(line);
}

export function getArtigoContentBlocks(conteudo: string): ArtigoContentBlock[] {
  const lines = getArtigoLines(conteudo);
  const blocks: ArtigoContentBlock[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const variant = getCalloutVariant(lines[index]);

    if (variant) {
      const closingIndex = lines.findIndex((line, lineIndex) => lineIndex > index && isCalloutEnd(line));

      if (closingIndex >= 0) {
        blocks.push({
          paragraphs: lines.slice(index + 1, closingIndex).filter(Boolean),
          type: "callout",
          variant,
        });
        index = closingIndex;
        continue;
      }
    }

    if (lines[index]) {
      blocks.push({ text: lines[index], type: "paragraph" });
    }
  }
  return blocks;
}

export function getArtigoParagraphs(conteudo: string) {
  return getArtigoContentBlocks(conteudo)
    .filter((block): block is Extract<ArtigoContentBlock, { type: "paragraph" }> => block.type === "paragraph")
    .map((block) => block.text);
}

export function getArtigoResumo(conteudo: string) {
  return getArtigoParagraphs(conteudo)[0] ?? "";
}
