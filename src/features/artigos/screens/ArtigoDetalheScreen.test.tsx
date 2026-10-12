import { render, screen } from "@testing-library/react-native";

import { ArtigoDetalheScreen } from "@/features/artigos/screens/ArtigoDetalheScreen";
import { useArtigo } from "@/features/artigos/hooks/use-artigo";

jest.mock("@/features/artigos/hooks/use-artigo", () => ({ useArtigo: jest.fn() }));
jest.mock("@/features/artigos/components/ArtigoSpeechPlayer", () => {
  const React = require("react");
  const { Text } = require("react-native");

  return { ArtigoSpeechPlayer: () => React.createElement(Text, { testID: "artigo-speech-player" }, "Ouvir artigo") };
});

const mockedUseArtigo = jest.mocked(useArtigo);

describe("ArtigoDetalheScreen", () => {
  beforeEach(() => {
    mockedUseArtigo.mockReturnValue({
      artigo: {
        autorId: "autor-1",
        autorNome: "Dra. Maria da Silva",
        categorias: [],
        conteudo: [
          "<h2>Conteúdo com formatação</h2><p>Texto <strong>importante</strong>.</p>",
          "<p>## Dica ##</p><p>Prefira alimentos leves.</p><p>##</p>",
          "<ul><li>Primeiro item</li></ul>",
          "<p>## Pergunta ##</p><p>Esta opção é segura?</p><p>##</p>",
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
      },
      error: null,
      isLoading: false,
    });
  });

  it("renders API summary, HTML, custom callouts and available credits", () => {
    render(<ArtigoDetalheScreen id="artigo-1" />);

    expect(screen.getByText("Resumo retornado pela API.")).toBeTruthy();
    expect(screen.getByLabelText("Dica")).toBeTruthy();
    expect(screen.getByLabelText("Pergunte ao seu médico")).toBeTruthy();
    expect(screen.getByText("Por Dra. Maria da Silva")).toBeTruthy();
    expect(screen.getByText("Publicado em 10 de outubro de 2026")).toBeTruthy();
    expect(screen.getByTestId("artigo-speech-player")).toBeTruthy();
    expect(screen.queryByText("## Dica ##")).toBeNull();
    expect(screen.queryByText("## Pergunta ##")).toBeNull();
    expect(screen.getAllByTestId("artigo-html-renderer")).toHaveLength(4);
  });
});
