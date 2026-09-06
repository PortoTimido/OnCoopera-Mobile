import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { RadarApoioListScreen } from "@/features/radar-apoio/screens";
import { getPatientProfile } from "@/lib/api/auth";
import { listApoios } from "@/lib/api/apoios";
import { setMemorySession } from "@/lib/auth/session";

jest.mock("@/lib/api/auth", () => ({ getPatientProfile: jest.fn() }));
jest.mock("@/lib/api/apoios", () => ({ listApoios: jest.fn() }));
jest.mock("@/features/home/hooks/use-home-clock", () => ({ useHomeClock: () => ({ dateTimeLabel: "QUARTA, 15 DE JULHO" }) }));
jest.mock("@/features/home/hooks/use-home-user", () => ({ useHomeUser: () => ({ initials: "PP" }) }));

const mockedGetPatientProfile = jest.mocked(getPatientProfile);
const mockedListApoios = jest.mocked(listApoios);

describe("radar apoio list screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setMemorySession({ accessToken: "token", usuario: { dataNascimento: "1990-01-01", email: "paciente@oncoopera.com", id: "user", login: "paciente", nome: "Paciente", perfisAdministrativos: [], status: "ATIVO", telefone: "11999999999", tipo: "PACIENTE", trocaSenhaObrigatoria: false, ultimoAcesso: null } });
    mockedGetPatientProfile.mockResolvedValue({ endereco: { bairro: "Centro", cep: "01000-000", cidade: "São Paulo", complemento: null, estado: "SP", id: "address", latitude: -23, logradouro: "Rua", longitude: -46, numero: "1" }, usuario: {} as never });
    mockedListApoios.mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });
  });

  afterEach(() => {
    jest.useRealTimers();
    setMemorySession(null);
    jest.clearAllMocks();
  });

  it("loads the saved city, filters by support type and exposes the empty state", async () => {
    render(<RadarApoioListScreen />);
    await waitFor(() => expect(screen.getByDisplayValue("São Paulo")).toBeTruthy());
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(mockedListApoios).toHaveBeenCalledWith(expect.objectContaining({ cidade: "São Paulo", tipoApoio: undefined })));

    fireEvent.press(screen.getByTestId("radar-filter-CLINICA"));
    await waitFor(() => expect(mockedListApoios).toHaveBeenLastCalledWith(expect.objectContaining({ tipoApoio: "CLINICA" })));
    expect(screen.getByText("Nenhum apoio encontrado para essa busca.")).toBeTruthy();
  });
});
