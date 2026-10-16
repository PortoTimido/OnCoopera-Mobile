import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Alert, BackHandler, Platform } from "react-native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

import { RadarApoioDetailScreen } from "@/features/radar-apoio/screens/RadarApoioDetailScreen";
import { getApoioById } from "@/lib/api/apoios";

let mockPanEnd: ((event: { translationY: number; velocityY: number }) => void) | undefined;

jest.mock("expo-router", () => ({ router: { back: jest.fn() }, useLocalSearchParams: () => ({ id: "apoio-1" }) }));
jest.mock("expo-linking", () => ({ openURL: jest.fn() }));
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  getCurrentPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));
jest.mock("@/lib/api/apoios", () => ({ getApoioById: jest.fn() }));
jest.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }) }));
jest.mock("react-native-gesture-handler", () => {
  const gesture = {
    activeOffsetY: () => gesture,
    onEnd: (callback: typeof mockPanEnd) => {
      mockPanEnd = callback;
      return gesture;
    },
    onUpdate: () => gesture,
  };

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

const mockedGetApoioById = jest.mocked(getApoioById);
const mockedGetPermission = jest.mocked(Location.getForegroundPermissionsAsync);
const mockedGetPosition = jest.mocked(Location.getCurrentPositionAsync);
const mockedOpenURL = jest.mocked(Linking.openURL);
const apoio = {
  dataAtualizacao: "2026-01-01T00:00:00.000Z",
  dataCriacao: "2026-01-01T00:00:00.000Z",
  descricao: "Acolhimento",
  endereco: { bairro: "Centro", cep: "01000-000", cidade: "São Paulo", complemento: null, estado: "SP", latitude: -23.55, logradouro: "Rua Teste", longitude: -46.63, numero: "35" },
  estaAbertoAgora: true,
  horarios: [{ diaSemana: 1, horarioFim: "18:00", horarioInicio: "08:00" }],
  id: "apoio-1",
  imagensUrl: [],
  nome: "INCA",
  status: "ATIVO" as const,
  telefone: "(11) 3000-0000",
  tipoApoio: "CLINICA" as const,
};

describe("radar apoio detail screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPanEnd = undefined;
    mockedGetPermission.mockResolvedValue({ granted: true, status: "granted" } as never);
    mockedGetPosition.mockResolvedValue({ coords: { latitude: -23.56, longitude: -46.64 } } as never);
    mockedOpenURL.mockResolvedValue(true);
  });

  it("shows a sheet skeleton while loading, without a back button", () => {
    mockedGetApoioById.mockImplementation(() => new Promise(() => undefined));

    render(<RadarApoioDetailScreen />);

    expect(screen.getByTestId("radar-apoio-detail-skeleton")).toBeTruthy();
    expect(screen.getByLabelText("Fechar detalhes do apoio")).toBeTruthy();
    expect(screen.queryByLabelText(/Voltar/)).toBeNull();
  });

  it("shows support information and opens Google Maps directions from the current position", async () => {
    mockedGetApoioById.mockResolvedValue(apoio);

    render(<RadarApoioDetailScreen />);

    await waitFor(() => expect(screen.getByText("INCA")).toBeTruthy());
    expect(mockedGetApoioById).toHaveBeenCalledWith("apoio-1");
    expect(screen.getByText("Rua Teste, 35\nCentro, São Paulo - SP")).toBeTruthy();
    expect(screen.getByText("(11) 3000-0000")).toBeTruthy();
    expect(screen.getByTestId("radar-directions-button").props.accessibilityState).toEqual({ disabled: false });
    fireEvent.press(screen.getByTestId("radar-directions-button"));
    await waitFor(() => expect(screen.getByTestId("radar-map-google")).toBeTruthy());
    fireEvent.press(screen.getByTestId("radar-map-google"));
    await waitFor(() => expect(mockedOpenURL).toHaveBeenCalledWith(Platform.OS === "ios"
      ? "comgooglemaps://?saddr=-23.56%2C-46.64&daddr=-23.55%2C-46.63&directionsmode=driving"
      : "google.navigation:q=-23.55%2C-46.63"));
  });

  it("opens Waze navigation for the selected support location", async () => {
    mockedGetApoioById.mockResolvedValue(apoio);
    render(<RadarApoioDetailScreen />);
    await waitFor(() => expect(screen.getByText("INCA")).toBeTruthy());
    fireEvent.press(screen.getByTestId("radar-directions-button"));
    await waitFor(() => expect(screen.getByTestId("radar-map-waze")).toBeTruthy());
    fireEvent.press(screen.getByTestId("radar-map-waze"));
    await waitFor(() => expect(mockedOpenURL).toHaveBeenCalledWith("waze://?ll=-23.55%2C-46.63&navigate=yes"));
  });

  it("does not open a map when location permission is denied", async () => {
    mockedGetApoioById.mockResolvedValue(apoio);
    mockedGetPermission.mockResolvedValue({ granted: false, status: "denied" } as never);
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({ granted: false, status: "denied" } as never);
    const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

    render(<RadarApoioDetailScreen />);
    await waitFor(() => expect(screen.getByText("INCA")).toBeTruthy());
    fireEvent.press(screen.getByTestId("radar-directions-button"));

    await waitFor(() => expect(alert).toHaveBeenCalledWith("Localização necessária", expect.any(String)));
    expect(screen.queryByTestId("radar-map-choices")).toBeNull();
    expect(mockedOpenURL).not.toHaveBeenCalled();
    alert.mockRestore();
  });

  it("closes through the backdrop, a qualifying downward drag, and Android back", () => {
    mockedGetApoioById.mockImplementation(() => new Promise(() => undefined));
    const backHandler = jest.spyOn(BackHandler, "addEventListener");

    const { unmount } = render(<RadarApoioDetailScreen />);
    const hardwareBack = backHandler.mock.calls[0][1];
    fireEvent.press(screen.getByTestId("radar-apoio-detail-backdrop"));
    expect(require("expo-router").router.back).toHaveBeenCalledTimes(1);
    unmount();

    jest.clearAllMocks();
    render(<RadarApoioDetailScreen />);
    act(() => mockPanEnd?.({ translationY: 500, velocityY: 0 }));
    expect(require("expo-router").router.back).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    render(<RadarApoioDetailScreen />);
    const secondHardwareBack = backHandler.mock.calls.at(-1)?.[1];
    act(() => secondHardwareBack?.({} as never));
    expect(require("expo-router").router.back).toHaveBeenCalledTimes(1);
  });

  it("keeps the sheet open after an insufficient drag and displays load errors inside it", async () => {
    mockedGetApoioById.mockRejectedValue(new Error("unavailable"));

    render(<RadarApoioDetailScreen />);
    act(() => mockPanEnd?.({ translationY: 1, velocityY: 0 }));
    expect(require("expo-router").router.back).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId("radar-apoio-detail-error")).toBeTruthy());
  });
});
