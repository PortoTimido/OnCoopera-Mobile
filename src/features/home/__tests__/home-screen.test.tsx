import { fireEvent, render, screen } from "@testing-library/react-native";

import { HomeScreen } from "@/features/home/screens/HomeScreen";
import type { AuthResponse } from "@/lib/api/auth";
import { setMemorySession } from "@/lib/auth/session";

const mockSetParams = jest.fn();
let mockMedicalGuidanceParams: { medicalGuidance?: string } = {};

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useFocusEffect: (effect: () => void) => require("react").useEffect(effect, []),
  useLocalSearchParams: () => mockMedicalGuidanceParams,
  useRouter: () => ({ setParams: mockSetParams }),
}));

jest.mock("@/features/home/hooks/use-home-clock", () => ({
  useHomeClock: () => ({
    dateTimeLabel: "QUINTA, 3 DE SETEMBRO",
    greeting: { emoji: "\ud83c\udf24\ufe0f", label: "Boa tarde" },
  }),
}));

const session: AuthResponse = {
  accessToken: "token",
  usuario: {
    dataNascimento: "1990-01-01",
    email: "ana@oncoopera.com",
    id: "user-id",
    login: "ana.costa",
    nome: "Ana Costa",
    perfisAdministrativos: [],
    status: "ATIVO",
    telefone: "11999999999",
    tipo: "PACIENTE",
    trocaSenhaObrigatoria: false,
    ultimoAcesso: null,
  },
};

describe("home screen", () => {
  beforeEach(() => {
    setMemorySession(session);
    mockMedicalGuidanceParams = {};
    mockSetParams.mockClear();
  });

  afterEach(() => {
    setMemorySession(null);
  });

  it("renders home content with authenticated user and Brasilia clock labels", () => {
    render(<HomeScreen />);

    expect(screen.getByTestId("home-screen")).toBeTruthy();
    expect(screen.getByText("In\u00edcio")).toBeTruthy();
    expect(screen.getByText("QUINTA, 3 DE SETEMBRO")).toBeTruthy();
    expect(screen.getByText("Boa tarde")).toBeTruthy();
    expect(screen.getByText("\ud83c\udf24\ufe0f")).toBeTruthy();
    expect(screen.getByText("Ana")).toBeTruthy();
    expect(screen.queryByText("Maria Silva")).toBeNull();
    expect(screen.getByLabelText("Configuracoes")).toBeTruthy();
    expect(screen.getAllByText("Diario")).toHaveLength(2);
    expect(screen.getByText("Apoio")).toBeTruthy();
    expect(screen.getByText("Artigos")).toBeTruthy();
    expect(screen.getByText("Como voce esta hoje?")).toBeTruthy();
    expect(screen.queryByText("Dr. Rafael Souza")).toBeNull();
    expect(screen.queryByText("PROXIMA CONSULTA")).toBeNull();
    expect(screen.getByText("Gerar relatorio medico")).toBeTruthy();
    expect(screen.getByTestId("home-medical-guidance-notice")).toBeTruthy();
    expect(screen.getByText(/As informações disponibilizadas pelo OnCoopera/)).toBeTruthy();
    expect(screen.queryByTestId("home-medical-guidance-modal")).toBeNull();
    expect(screen.getByTestId("home-nav-inicio").props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });
    expect(screen.getByTestId("home-nav-diario").props.accessibilityState).toEqual({
      disabled: false,
      selected: undefined,
    });
  });

  it("shows and dismisses the medical guidance after authentication", () => {
    mockMedicalGuidanceParams = { medicalGuidance: "1" };

    render(<HomeScreen />);

    expect(screen.getByTestId("home-medical-guidance-modal")).toBeTruthy();
    expect(screen.getByText("Sempre consulte seu médico")).toBeTruthy();
    expect(screen.getAllByTestId("home-medical-guidance-hospital-icon")).not.toHaveLength(0);
    expect(mockSetParams).toHaveBeenCalledWith({ medicalGuidance: undefined });

    fireEvent.press(screen.getByTestId("home-medical-guidance-confirm"));

    expect(screen.queryByTestId("home-medical-guidance-modal")).toBeNull();
  });
});
