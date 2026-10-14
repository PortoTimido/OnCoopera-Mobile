import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { DiarioRegistroDetailScreen } from "@/features/diario-sintomas/screens/DiarioRegistroDetailScreen";
import { buildNotaVozSource, getRegistroDiarioById } from "@/lib/api/diario-sintomas";

const mockPlayAudio = jest.fn();
const mockPauseAudio = jest.fn();

jest.mock("expo-router", () => ({ router: { back: jest.fn() }, useLocalSearchParams: () => ({ id: "registro-1" }) }));
jest.mock("@/lib/api/diario-sintomas", () => ({
  buildNotaVozSource: jest.fn(),
  getRegistroDiarioById: jest.fn(),
}));
jest.mock("@/lib/auth/session", () => ({ getAccessToken: jest.fn(async () => "token") }));
jest.mock("expo-audio", () => ({
  useAudioPlayer: () => ({ pause: mockPauseAudio, play: mockPlayAudio }),
  useAudioPlayerStatus: () => ({ duration: 0, playing: false }),
}));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }) }));
jest.mock("react-native-gesture-handler", () => {
  const gesture = { activeOffsetY: () => gesture, onEnd: () => gesture, onUpdate: () => gesture };
  return { Gesture: { Pan: () => gesture }, GestureDetector: ({ children }: { children: React.ReactNode }) => children };
});
jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    runOnJS: (callback: () => void) => callback,
    useAnimatedStyle: (callback: () => object) => callback(),
    useSharedValue: (value: number) => ({ value }),
    withSpring: (value: number) => value,
    withTiming: (value: number, _config?: object, callback?: (finished: boolean) => void) => {
      callback?.(true);
      return value;
    },
  };
});

describe("diary record detail sheet", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows the date from dataHora and closes when the backdrop is pressed", async () => {
    jest.mocked(getRegistroDiarioById).mockResolvedValue({
      dataHora: "2024-07-14T10:00:00.000Z",
      dataRegistro: undefined as unknown as string,
      humor: "MUITO_BEM",
      id: "registro-1",
      notaVozUrl: null,
      sintomas: [{ intensidade: 10, tipo: "FEBRE" }],
    });

    render(<DiarioRegistroDetailScreen />);

    expect(screen.getByTestId("diario-registro-detail-skeleton")).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Domingo, 14 de jul")).toBeTruthy());
    expect(screen.getByText("Febre")).toBeTruthy();
    expect(screen.queryByTestId("diario-detail-play-nota-voz")).toBeNull();
    fireEvent.press(screen.getByTestId("diario-registro-detail-backdrop"));
    expect(require("expo-router").router.back).toHaveBeenCalledTimes(1);
  });

  it("lets the patient play the saved voice note for a previous day", async () => {
    jest.mocked(buildNotaVozSource).mockReturnValue({
      headers: { Authorization: "Bearer token" },
      uri: "https://example.com/registro-1/nota-voz",
    });
    jest.mocked(getRegistroDiarioById).mockResolvedValue({
      dataHora: "2026-10-13T18:00:00.000Z",
      dataRegistro: "2026-10-13T00:00:00.000Z",
      humor: "BEM",
      id: "registro-1",
      notaVozUrl: "diario-sintomas/notas-voz/audio.m4a",
      sintomas: [{ intensidade: 4, tipo: "DOR" }],
    });

    render(<DiarioRegistroDetailScreen />);

    const playButton = await screen.findByTestId("diario-detail-play-nota-voz");
    expect(jest.mocked(buildNotaVozSource)).toHaveBeenCalledWith("registro-1", "token");
    fireEvent.press(playButton);
    expect(mockPlayAudio).toHaveBeenCalledTimes(1);
  });
});
