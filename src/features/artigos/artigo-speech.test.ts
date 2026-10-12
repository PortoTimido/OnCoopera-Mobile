import { buildArtigoNarrationSegments, htmlToNarrationSegments } from "@/features/artigos/artigo-speech";
import type { Artigo } from "@/lib/api/artigos";

const artigo: Artigo = {
  autorId: "autor-1",
  autorNome: "Maria da Silva",
  categorias: [],
  conteudo: [
    "<h2>Cuidados importantes</h2>",
    "<p>Leia com <strong>atenção</strong> &amp; converse com sua equipe.</p>",
    '<img alt="Ilustração do tratamento" src="https://example.com/image.png" />',
    "<p>## Dica ##</p><p>Prefira alimentos leves.</p><p>##</p>",
    "<ul><li>Primeiro item</li><li>Segundo item</li></ul>",
    "<p>## Pergunta ##</p><p>Esta opção é segura?</p><p>##</p>",
    "<script>não narrar</script>",
  ].join(""),
  dataAtualizacao: "2026-10-10T12:00:00.000Z",
  dataCriacao: "2026-10-10T12:00:00.000Z",
  dataPublicacao: "2026-10-10T12:00:00.000Z",
  id: "artigo-1",
  imagemUrl: null,
  resumo: "Resumo retornado pela API.",
  status: "PUBLICADO",
  tags: [],
  tempoLeituraMinutos: 4,
  titulo: "Título do artigo",
};

describe("article speech formatting", () => {
  it("turns HTML into logical text segments without technical content", () => {
    expect(htmlToNarrationSegments("<h2>Título</h2><p>Atenção: &Aacute;gua&nbsp;útil &#33;</p><script>segredo</script>")).toEqual([
      "Título",
      "Atenção: Água útil !",
    ]);
  });

  it("builds the complete narration in visual order", () => {
    expect(buildArtigoNarrationSegments(artigo, 4_000)).toEqual([
      "Título do artigo",
      "Resumo retornado pela API.",
      "Cuidados importantes",
      "Leia com atenção & converse com sua equipe.",
      "Ilustração do tratamento",
      "Dica.",
      "Prefira alimentos leves.",
      "Primeiro item",
      "Segundo item",
      "Pergunta.",
      "Esta opção é segura?",
      "Créditos.",
      "Por Maria da Silva.",
      "Publicado em 10 de outubro de 2026.",
    ]);
  });

  it("splits long passages without dropping text", () => {
    const longArticle = { ...artigo, autorNome: "", conteudo: "<p>um dois três quatro cinco seis</p>", dataPublicacao: null, resumo: null };
    const segments = buildArtigoNarrationSegments(longArticle, 10);

    expect(segments.every((segment) => segment.length <= 10)).toBe(true);
    expect(segments.slice(2).join(" ")).toBe("um dois três quatro cinco seis");
  });
});
