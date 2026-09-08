import { render, screen } from "@testing-library/react-native";

import { HomeScreen } from "@/features/home/screens/HomeScreen";
import type { AuthResponse } from "@/lib/api/auth";
import { setMemorySession } from "@/lib/auth/session";

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useFocusEffect: (effect: () => void) => require("react").useEffect(effect, []),
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
    expect(screen.getByText("Dr. Rafael Souza")).toBeTruthy();
    expect(screen.getByText("Gerar relatorio medico")).toBeTruthy();
    expect(screen.getByTestId("home-nav-inicio").props.accessibilityState).toEqual({
      disabled: false,
      selected: true,
    });
    expect(screen.getByTestId("home-nav-diario").props.accessibilityState).toEqual({
      disabled: false,
      selected: undefined,
    });
  });
});
