import { formatArtigoDataPublicacao, getArtigoContentBlocks } from "@/features/artigos/artigo-content";

describe("artigo content", () => {
  it("separates HTML, tip, and question blocks while preserving their order", () => {
    const conteudo = [
      "<p>Introdução &amp; contexto.</p>",
      "<p>## Dica ##</p>",
      "<p>Primeira orientação.</p>",
      "<p>Segunda orientação.</p>",
      "<p>##</p>",
      "<p>Texto entre os cards.</p>",
      "<p>## Pergunta ##</p>",
      "<p>\"Esta opção é segura?\"</p>",
      "<p>##</p>",
      "<p>Conclusão.</p>",
    ].join("");

    expect(getArtigoContentBlocks(conteudo)).toEqual([
      { html: "<p>Introdução &amp; contexto.</p>", type: "html" },
      { html: "<p>Primeira orientação.</p><p>Segunda orientação.</p>", type: "callout", variant: "dica" },
      { html: "<p>Texto entre os cards.</p>", type: "html" },
      { html: '<p>"Esta opção é segura?"</p>', type: "callout", variant: "pergunta" },
      { html: "<p>Conclusão.</p>", type: "html" },
    ]);
  });

  it("keeps incomplete or unknown markers as ordinary HTML content", () => {
    const conteudo = "Resumo\n## Dica ##\nConteúdo sem fechamento\n## Alerta ##\nTexto";

    expect(getArtigoContentBlocks(conteudo)).toEqual([
      { html: "Resumo", type: "html" },
      { html: "\n## Dica ##\nConteúdo sem fechamento\n## Alerta ##\nTexto", type: "html" },
    ]);
  });

  it("accepts missing content and formats only valid publication dates", () => {
    expect(getArtigoContentBlocks(undefined)).toEqual([]);
    expect(formatArtigoDataPublicacao("invalida")).toBeUndefined();
    expect(formatArtigoDataPublicacao("2026-10-10T12:00:00.000Z")).toBe("10 de outubro de 2026");
  });
});
