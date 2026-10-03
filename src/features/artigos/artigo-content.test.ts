import { getArtigoContentBlocks, getArtigoParagraphs, getArtigoResumo } from "@/features/artigos/artigo-content";

describe("artigo content", () => {
  it("separates text, tip, and question blocks while preserving their order", () => {
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
      { text: "Introdução & contexto.", type: "paragraph" },
      { paragraphs: ["Primeira orientação.", "Segunda orientação."], type: "callout", variant: "dica" },
      { text: "Texto entre os cards.", type: "paragraph" },
      { paragraphs: ['"Esta opção é segura?"'], type: "callout", variant: "pergunta" },
      { text: "Conclusão.", type: "paragraph" },
    ]);
  });

  it("keeps incomplete or unknown markers as ordinary content", () => {
    const conteudo = "Resumo\n## Dica ##\nConteúdo sem fechamento\n## Alerta ##\nTexto";

    expect(getArtigoParagraphs(conteudo)).toEqual([
      "Resumo",
      "## Dica ##",
      "Conteúdo sem fechamento",
      "## Alerta ##",
      "Texto",
    ]);
    expect(getArtigoResumo(conteudo)).toBe("Resumo");
  });
});
