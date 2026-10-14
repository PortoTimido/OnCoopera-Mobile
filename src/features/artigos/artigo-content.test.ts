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

  it("recognizes standalone markers wrapped in inline HTML while retaining the callout markup", () => {
    const conteudo = [
      '<p class="marker"><strong> ##&nbsp;dIcA&nbsp;## </strong></p>',
      '<p><em>Prefira alimentos leves.</em></p>',
      '<div><span> ## </span></div>',
      '<h3><span>## PERGUNTA ##</span></h3>',
      '<p><a href="https://example.com">Esta opcao e segura?</a></p>',
      '<p><strong>##</strong></p>',
    ].join("");

    expect(getArtigoContentBlocks(conteudo)).toEqual([
      { html: "<p><em>Prefira alimentos leves.</em></p>", type: "callout", variant: "dica" },
      { html: '<p><a href="https://example.com">Esta opcao e segura?</a></p>', type: "callout", variant: "pergunta" },
    ]);
  });

  it("does not turn markers mixed with ordinary text into a card", () => {
    const conteudo = "<p>Leia ## Dica ## antes de continuar.</p><p>##</p>";

    expect(getArtigoContentBlocks(conteudo)).toEqual([{ html: conteudo, type: "html" }]);
  });

  it("accepts missing content and formats only valid publication dates", () => {
    expect(getArtigoContentBlocks(undefined)).toEqual([]);
    expect(formatArtigoDataPublicacao("invalida")).toBeUndefined();
    expect(formatArtigoDataPublicacao("2026-10-10T12:00:00.000Z")).toBe("10 de outubro de 2026");
  });
});
