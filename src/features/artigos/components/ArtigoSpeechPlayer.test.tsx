import { fireEvent, render, screen } from "@testing-library/react-native";

import { ArtigoSpeechPlayer } from "@/features/artigos/components/ArtigoSpeechPlayer";
import { useArtigoSpeech } from "@/features/artigos/hooks/use-artigo-speech";
import type { Artigo } from "@/lib/api/artigos";

jest.mock("@/features/artigos/hooks/use-artigo-speech", () => ({
  ARTIGO_SPEECH_RATES: [0.75, 1, 1.25, 1.5],
  useArtigoSpeech: jest.fn(),
}));

const mockedUseArtigoSpeech = jest.mocked(useArtigoSpeech);
const start = jest.fn(async () => undefined);
const stop = jest.fn(async () => undefined);
const pause = jest.fn(async () => undefined);
const resume = jest.fn(async () => undefined);
const setRate = jest.fn();

const artigo = { id: "artigo-1" } as Artigo;

describe("ArtigoSpeechPlayer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseArtigoSpeech.mockReturnValue({ canPause: true, error: null, pause, rate: 1, resume, setRate, start, status: "idle", stop });
  });

  it("starts reading and exposes accessible rate controls", () => {
    render(<ArtigoSpeechPlayer artigo={artigo} />);

    fireEvent.press(screen.getByLabelText("Iniciar leitura do artigo"));
    fireEvent.press(screen.getByLabelText("Velocidade 1,25x"));

    expect(start).toHaveBeenCalledTimes(1);
    expect(setRate).toHaveBeenCalledWith(1.25);
    expect(screen.getByLabelText("Velocidade 1x").props.accessibilityState).toEqual({ selected: true });
  });

  it("shows a disabled pause control when the platform cannot pause", () => {
    mockedUseArtigoSpeech.mockReturnValue({ canPause: false, error: null, pause, rate: 1, resume, setRate, start, status: "speaking", stop });

    render(<ArtigoSpeechPlayer artigo={artigo} />);

    expect(screen.getByLabelText("Pausar leitura indisponível no Android").props.accessibilityState).toEqual({ disabled: true });
    expect(screen.getByText("Pausa e retomada não estão disponíveis no Android.")).toBeTruthy();
  });
});
