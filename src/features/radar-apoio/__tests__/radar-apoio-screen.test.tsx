import * as Location from "expo-location";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { RadarApoioListScreen } from "@/features/radar-apoio/screens";
import { getPatientProfile } from "@/lib/api/auth";
import { listApoios, type Apoio } from "@/lib/api/apoios";
import { setMemorySession } from "@/lib/auth/session";

jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return { __esModule: true, default: View, Callout: View, Marker: View, PROVIDER_GOOGLE: "google" };
});
jest.mock("expo-location", () => ({
  Accuracy: { Balanced: 3 },
  geocodeAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));
jest.mock("@/lib/api/auth", () => ({ getPatientProfile: jest.fn() }));
jest.mock("@/lib/api/apoios", () => ({ listApoios: jest.fn() }));
jest.mock("@/features/home/hooks/use-home-clock", () => ({ useHomeClock: () => ({ dateTimeLabel: "QUARTA, 15 DE JULHO" }) }));
jest.mock("@/features/home/hooks/use-home-user", () => ({ useHomeUser: () => ({ initials: "PP" }) }));

const mockedLocation = jest.mocked(Location);
const mockedGetPatientProfile = jest.mocked(getPatientProfile);
const mockedListApoios = jest.mocked(listApoios);

const apoio: Apoio = {
  dataAtualizacao: "2026-01-01T00:00:00.000Z", dataCriacao: "2026-01-01T00:00:00.000Z", descricao: "Acolhimento", distanciaKm: 1.2,
  endereco: { bairro: "Centro", cep: "01000-000", cidade: "São Paulo", complemento: null, estado: "SP", latitude: -23.55, logradouro: "Rua Teste", longitude: -46.63, numero: "1" },
  estaAbertoAgora: true, horarios: [], id: "apoio-1", imagensUrl: [], nome: "Casa de Apoio", status: "ATIVO", telefone: "11999999999", tipoApoio: "CASA_APOIO",
};

describe("radar apoio list screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setMemorySession({ accessToken: "token", usuario: { dataNascimento: "1990-01-01", email: "paciente@oncoopera.com", id: "user", login: "paciente", nome: "Paciente", perfisAdministrativos: [], status: "ATIVO", telefone: "11999999999", tipo: "PACIENTE", trocaSenhaObrigatoria: false, ultimoAcesso: null } });
    mockedGetPatientProfile.mockResolvedValue({ endereco: { bairro: "Centro", cep: "01000-000", cidade: "São Paulo", complemento: null, estado: "SP", id: "address", latitude: -23, logradouro: "Rua", longitude: -46, numero: "1" }, usuario: {} as never });
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValue({ status: "granted" } as never);
    mockedLocation.geocodeAsync.mockResolvedValue([{ latitude: -23.56, longitude: -46.65 }] as never);
    mockedLocation.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: -22, longitude: -43 } } as never);
    mockedListApoios.mockResolvedValue({ data: [], page: 1, pageSize: 10, total: 0, totalPages: 0 });
  });

  afterEach(() => {
    jest.useRealTimers();
    setMemorySession(null);
    jest.clearAllMocks();
  });

  it("uses the geocoded city and loads ten supports per page", async () => {
    render(<RadarApoioListScreen />);
    await waitFor(() => expect(screen.getByDisplayValue("São Paulo")).toBeTruthy());
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(mockedListApoios).toHaveBeenCalledWith(expect.objectContaining({ cidade: "São Paulo", latitude: -23.56, longitude: -46.65, page: 1, pageSize: 10 })));
  });

  it("falls back to device coordinates and then the profile address", async () => {
    mockedLocation.geocodeAsync.mockResolvedValue([] as never);
    render(<RadarApoioListScreen />);
    await waitFor(() => expect(mockedListApoios).toHaveBeenCalledWith(expect.objectContaining({ latitude: -22, longitude: -43 })));

    mockedLocation.getCurrentPositionAsync.mockRejectedValueOnce(new Error("unavailable"));
    fireEvent.changeText(screen.getByLabelText("Cidade para buscar apoios"), "Rio de Janeiro");
    fireEvent(screen.getByLabelText("Cidade para buscar apoios"), "blur");
    await waitFor(() => expect(mockedListApoios).toHaveBeenLastCalledWith(expect.objectContaining({ cidade: "Rio de Janeiro", latitude: -23, longitude: -46 })));
  });

  it("keeps the listing available when no reference coordinate is available", async () => {
    mockedGetPatientProfile.mockResolvedValueOnce({ endereco: undefined, usuario: {} as never } as never);
    mockedLocation.getForegroundPermissionsAsync.mockResolvedValueOnce({ status: "denied" } as never);
    render(<RadarApoioListScreen />);
    await waitFor(() => expect(screen.getByText(/Informe uma cidade válida/)).toBeTruthy());
    expect(mockedListApoios).not.toHaveBeenCalled();
  });

  it("loads the next page once when the list reaches its end", async () => {
    mockedListApoios.mockResolvedValueOnce({ data: [apoio], page: 1, pageSize: 10, total: 11, totalPages: 2 });
    mockedListApoios.mockResolvedValueOnce({ data: [{ ...apoio, id: "apoio-2", nome: "Clínica" }], page: 2, pageSize: 10, total: 11, totalPages: 2 });
    render(<RadarApoioListScreen />);
    await waitFor(() => expect(screen.getByLabelText("Abrir Casa de Apoio")).toBeTruthy());
    fireEvent(screen.getByTestId("radar-apoio-list"), "onEndReached");
    fireEvent(screen.getByTestId("radar-apoio-list"), "onEndReached");
    await waitFor(() => expect(mockedListApoios).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 10 })));
    expect(mockedListApoios).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(screen.getByLabelText("Abrir Clínica")).toBeTruthy());
  });
});
