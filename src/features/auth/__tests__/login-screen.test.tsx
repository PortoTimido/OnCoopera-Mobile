import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import type { AuthResponse } from "@/lib/api/auth";
import { login } from "@/lib/api/auth";
import { saveAuthSession } from "@/lib/auth/session";

jest.mock("@/lib/api/auth", () => {
  const actual = jest.requireActual("@/lib/api/auth");
  return { ...actual, login: jest.fn() };
});

jest.mock("@/lib/auth/session", () => ({
  saveAuthSession: jest.fn(),
}));

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useLocalSearchParams: () => ({}),
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
}));

const mockedLogin = jest.mocked(login);
const mockedSaveAuthSession = jest.mocked(saveAuthSession);

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

describe("login screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens the medical guidance on Home after a successful login", async () => {
    mockedLogin.mockResolvedValue(session);

    await render(<LoginScreen />);

    await fireEvent.changeText(screen.getByTestId("login-identificador"), "ana@oncoopera.com");
    await fireEvent.changeText(screen.getByTestId("login-senha"), "Senha1!");
    await fireEvent.press(screen.getByTestId("login-submit"));

    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith({ identificador: "ana@oncoopera.com", senha: "Senha1!" }),
    );
    await waitFor(() => expect(mockedSaveAuthSession).toHaveBeenCalledWith(session, false));
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/inicio", params: { medicalGuidance: "1" } });
  });
});
