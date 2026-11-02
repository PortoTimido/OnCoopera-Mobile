import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { SettingsScreen } from "@/features/settings/screens/SettingsScreen";
import type { AuthResponse } from "@/lib/api/auth";
import { getMemorySession, setMemorySession } from "@/lib/auth/session";
import { signOutGoogle } from "@/lib/auth/google-sign-in";

jest.mock("@/lib/auth/google-sign-in", () => ({
  signOutGoogle: jest.fn(async () => undefined),
}));

const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
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

const mockedSignOutGoogle = jest.mocked(signOutGoogle);

function mockResponse(status: number, body?: unknown) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? "" : JSON.stringify(body)),
  } as Response);
}

describe("settings screen", () => {
  beforeEach(() => {
    setMemorySession(session);
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000/api";
    globalThis.fetch = jest.fn();
    mockRouterReplace.mockClear();
    mockRouterPush.mockClear();
  });

  afterEach(() => {
    setMemorySession(null);
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  it("renders settings content with the authenticated user's profile", async () => {
    await render(<SettingsScreen />);

    expect(screen.getByTestId("settings-screen")).toBeTruthy();
    expect(screen.getByText("OnCoopera")).toBeTruthy();
    expect(screen.getByText("Configurações")).toBeTruthy();
    expect(screen.getByText("Ana Costa")).toBeTruthy();
    expect(screen.getByText("ana@oncoopera.com")).toBeTruthy();
    expect(screen.getByText("Notificacoes")).toBeTruthy();
    expect(screen.getByText("Alertas importantes")).toBeTruthy();
    expect(screen.getByText("Privacidade e Seguranca")).toBeTruthy();
    expect(screen.getByText("Alterar senha")).toBeTruthy();
    expect(screen.getByText("Privacidade de dados")).toBeTruthy();
    expect(screen.getByText("Termos de uso")).toBeTruthy();
    expect(screen.getByText("Politica de privacidade")).toBeTruthy();
    expect(screen.getByTestId("settings-logout")).toBeTruthy();

    expect(screen.getByTestId("settings-edit-profile").props.accessibilityState?.disabled).toBeFalsy();
    expect(screen.getByTestId("settings-alterar-senha").props.accessibilityState?.disabled).toBeFalsy();
    expect(screen.getByTestId("settings-privacidade-dados").props.accessibilityState?.disabled).toBe(true);
    expect(screen.getByTestId("settings-termos-uso").props.accessibilityState?.disabled).toBe(false);
    expect(screen.getByTestId("settings-politica-privacidade").props.accessibilityState?.disabled).toBe(false);
  });

  it("opens the legal document selected in settings", async () => {
    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId("settings-termos-uso"));
    await fireEvent.press(screen.getByTestId("settings-politica-privacidade"));

    expect(mockRouterPush).toHaveBeenNthCalledWith(1, "/documentos-legais/TERMOS_USO");
    expect(mockRouterPush).toHaveBeenNthCalledWith(2, "/documentos-legais/POLITICA_PRIVACIDADE");
  });

  it("updates the patient's name through the edit name modal", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(
      await mockResponse(200, {
        endereco: null,
        usuario: { ...session.usuario, nome: "Ana Paula Costa" },
      }),
    );

    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByTestId("settings-edit-profile"));
    await fireEvent.changeText(screen.getByTestId("settings-edit-name-input"), "Ana Paula Costa");
    await fireEvent.press(screen.getByTestId("settings-edit-name-save"));

    await waitFor(() => expect(screen.getByText("Ana Paula Costa")).toBeTruthy());

    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/mobile/pacientes/me");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(options.body)).toEqual({ nome: "Ana Paula Costa" });
    expect(getMemorySession()?.usuario.nome).toBe("Ana Paula Costa");
  });

  it("changes the patient's password through the change password modal", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(204));

    await render(<SettingsScreen />);

    await fireEvent.press(screen.getByTestId("settings-alterar-senha"));
    await fireEvent.changeText(screen.getByTestId("settings-current-password"), "SenhaAtual!123");
    await fireEvent.changeText(screen.getByTestId("settings-new-password"), "SenhaNova!12345");
    await fireEvent.changeText(screen.getByTestId("settings-confirm-password"), "SenhaNova!12345");
    await fireEvent.press(screen.getByTestId("settings-change-password-save"));

    await waitFor(() => expect(getMemorySession()).toBeNull());
    expect(mockRouterReplace).toHaveBeenCalledWith({
      params: { passwordChanged: "1" },
      pathname: "/login",
    });

    const [url, options] = (globalThis.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/auth/change-password");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({
      novaSenha: "SenhaNova!12345",
      senhaAtual: "SenhaAtual!123",
    });
  });

  it("clears the Google and OnCoopera sessions on logout", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce(await mockResponse(204));

    await render(<SettingsScreen />);
    await fireEvent.press(screen.getByTestId("settings-logout"));

    await waitFor(() => expect(getMemorySession()).toBeNull());
    expect(mockedSignOutGoogle).toHaveBeenCalledTimes(1);
    expect(mockRouterReplace).toHaveBeenCalledWith("/login");
  });
});
