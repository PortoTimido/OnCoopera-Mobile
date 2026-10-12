import { act, renderHook, waitFor } from "@testing-library/react-native";
import * as Speech from "expo-speech";

import { useArtigoSpeech } from "@/features/artigos/hooks/use-artigo-speech";
import type { Artigo } from "@/lib/api/artigos";

jest.mock("expo-router", () => {
  const React = require("react");

  return { useFocusEffect: (effect: () => void | (() => void)) => React.useEffect(effect, [effect]) };
});
jest.mock("expo-speech", () => ({
  VoiceQuality: { Default: "Default", Enhanced: "Enhanced" },
  getAvailableVoicesAsync: jest.fn(),
  maxSpeechInputLength: 4_000,
  pause: jest.fn(),
  resume: jest.fn(),
  speak: jest.fn(),
  stop: jest.fn(),
}));

const mockedGetAvailableVoices = jest.mocked(Speech.getAvailableVoicesAsync);
const mockedPause = jest.mocked(Speech.pause);
const mockedResume = jest.mocked(Speech.resume);
const mockedSpeak = jest.mocked(Speech.speak);
const mockedStop = jest.mocked(Speech.stop);

const artigo: Artigo = {
  autorId: "autor-1",
  autorNome: "Maria",
  categorias: [],
  conteudo: "<p>Primeiro trecho.</p><p>Segundo trecho.</p>",
  dataAtualizacao: "2026-10-10T12:00:00.000Z",
  dataCriacao: "2026-10-10T12:00:00.000Z",
  dataPublicacao: null,
  id: "artigo-1",
  imagemUrl: null,
  resumo: "Resumo.",
  status: "PUBLICADO",
  tags: [],
  tempoLeituraMinutos: 1,
  titulo: "Título",
};

describe("useArtigoSpeech", () => {
  const originalExpoOs = process.env.EXPO_OS;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_OS = "ios";
    mockedStop.mockResolvedValue(undefined);
    mockedPause.mockResolvedValue(undefined);
    mockedResume.mockResolvedValue(undefined);
    mockedGetAvailableVoices.mockResolvedValue([
      { identifier: "pt-default", language: "pt-BR", name: "Português", quality: Speech.VoiceQuality.Default },
      { identifier: "pt-enhanced", language: "pt_BR", name: "Português aprimorado", quality: Speech.VoiceQuality.Enhanced },
    ]);
  });

  afterAll(() => {
    process.env.EXPO_OS = originalExpoOs;
  });

  it("uses a Brazilian voice and applies rate changes to the next segment", async () => {
    const { result } = renderHook(() => useArtigoSpeech(artigo));

    await waitFor(() => expect(mockedGetAvailableVoices).toHaveBeenCalled());
    await act(async () => result.current.start());

    expect(mockedSpeak).toHaveBeenCalledWith(
      "Título",
      expect.objectContaining({ language: "pt-BR", rate: 1, voice: "pt-enhanced" }),
    );

    act(() => {
      const options = mockedSpeak.mock.calls[0][1];
      options?.onStart?.();
      result.current.setRate(1.5);
      options?.onDone?.();
    });

    expect(result.current.status).toBe("speaking");
    expect(mockedSpeak).toHaveBeenLastCalledWith("Resumo.", expect.objectContaining({ rate: 1.5 }));
  });

  it("pauses, resumes, stops, and cleans up on unmount", async () => {
    const { result, unmount } = renderHook(() => useArtigoSpeech(artigo));

    await act(async () => result.current.start());
    act(() => mockedSpeak.mock.calls.at(-1)?.[1]?.onStart?.());

    await act(async () => result.current.pause());
    expect(mockedPause).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("paused");

    await act(async () => result.current.resume());
    expect(mockedResume).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("speaking");

    await act(async () => result.current.stop());
    expect(result.current.status).toBe("idle");

    unmount();
    expect(mockedStop).toHaveBeenCalled();
  });

  it("does not simulate pause on Android", async () => {
    const { result } = renderHook(() => useArtigoSpeech(artigo, "android"));

    expect(result.current.canPause).toBe(false);
    await act(async () => result.current.pause());
    expect(mockedPause).not.toHaveBeenCalled();
  });

  it("moves to the error state when speech fails", async () => {
    mockedSpeak.mockImplementationOnce((_text, options) => options?.onError?.(new Error("falha")));
    const { result } = renderHook(() => useArtigoSpeech(artigo));

    await act(async () => result.current.start());

    expect(result.current.status).toBe("error");
    expect(result.current.error).toBe("Não foi possível reproduzir a leitura. Tente novamente.");
  });

  it("finishes after narrating every segment", async () => {
    const { result } = renderHook(() => useArtigoSpeech(artigo));

    await act(async () => result.current.start());

    for (let index = 0; index < 6; index += 1) {
      act(() => mockedSpeak.mock.calls[index][1]?.onDone?.());
    }

    expect(mockedSpeak).toHaveBeenCalledTimes(6);
    expect(result.current.status).toBe("finished");
  });

  it("stops the current speech when another article is opened", async () => {
    const { rerender, result } = renderHook<
      ReturnType<typeof useArtigoSpeech>,
      { currentArticle: Artigo }
    >(({ currentArticle }) => useArtigoSpeech(currentArticle), {
      initialProps: { currentArticle: artigo },
    });

    await act(async () => result.current.start());
    act(() => mockedSpeak.mock.calls.at(-1)?.[1]?.onStart?.());
    const callsBeforeArticleChange = mockedStop.mock.calls.length;

    rerender({ currentArticle: { ...artigo, id: "artigo-2", titulo: "Outro título" } });

    expect(mockedStop.mock.calls.length).toBeGreaterThan(callsBeforeArticleChange);
    expect(result.current.status).toBe("idle");
  });
});
