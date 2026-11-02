import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { LoginScreen } from "@/features/auth/screens/LoginScreen";
import type { AuthResponse } from "@/lib/api/auth";
import { login, loginWithGoogle } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveAuthSession } from "@/lib/auth/session";
import {
  getGoogleIdToken,
  GoogleSignInError,
  isGoogleSignInAvailable,
} from "@/lib/auth/google-sign-in";

jest.mock("@/lib/api/auth", () => {
  const actual = jest.requireActual("@/lib/api/auth");
  return { ...actual, login: jest.fn(), loginWithGoogle: jest.fn() };
});

jest.mock("@/lib/auth/google-sign-in", () => {
  const actual = jest.requireActual("@/lib/auth/google-sign-in");
  return {
    ...actual,
    getGoogleIdToken: jest.fn(),
    isGoogleSignInAvailable: jest.fn(),
  };
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
const mockedLoginWithGoogle = jest.mocked(loginWithGoogle);
const mockedGetGoogleIdToken = jest.mocked(getGoogleIdToken);
const mockedIsGoogleSignInAvailable = jest.mocked(isGoogleSignInAvailable);
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
    mockedIsGoogleSignInAvailable.mockReturnValue(true);
    mockedGetGoogleIdToken.mockResolvedValue({
      idToken: "google-id-token",
      type: "success",
    });
    mockedLoginWithGoogle.mockResolvedValue(session);
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
    expect(mockedGetGoogleIdToken).not.toHaveBeenCalled();
  });

  it("stores the backend session after a successful Google sign in", async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByTestId("login-remember"));
    await fireEvent.press(screen.getByTestId("login-google"));

    await waitFor(() =>
      expect(mockedLoginWithGoogle).toHaveBeenCalledWith({ idToken: "google-id-token" }),
    );
    expect(mockedSaveAuthSession).toHaveBeenCalledWith(session, true);
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/inicio",
      params: { medicalGuidance: "1" },
    });
  });

  it("silently handles a Google sign in cancellation", async () => {
    mockedGetGoogleIdToken.mockResolvedValue({ type: "cancelled" });

    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId("login-google"));

    await waitFor(() => expect(mockedGetGoogleIdToken).toHaveBeenCalledTimes(1));
    expect(mockedLoginWithGoogle).not.toHaveBeenCalled();
    expect(mockedSaveAuthSession).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a safe message for Google authentication failures", async () => {
    mockedGetGoogleIdToken.mockRejectedValue(
      new GoogleSignInError("authentication"),
    );

    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId("login-google"));

    expect(
      await screen.findByText("Não foi possível entrar com o Google agora."),
    ).toBeTruthy();
    expect(mockedLoginWithGoogle).not.toHaveBeenCalled();
  });

  it("shows a safe network message when the backend exchange fails", async () => {
    mockedLoginWithGoogle.mockRejectedValue(
      new ApiError(0, "Não foi possível conectar à API."),
    );

    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId("login-google"));

    expect(await screen.findByText("Não foi possível conectar à API.")).toBeTruthy();
    expect(mockedSaveAuthSession).not.toHaveBeenCalled();
  });

  it("disables the Google action while a request is in progress", async () => {
    let finishGoogleSignIn: ((value: { type: "cancelled" }) => void) | undefined;
    mockedGetGoogleIdToken.mockReturnValue(
      new Promise((resolve) => {
        finishGoogleSignIn = resolve;
      }),
    );

    await render(<LoginScreen />);
    await fireEvent.press(screen.getByTestId("login-google"));

    expect(mockedGetGoogleIdToken).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("login-google").props.accessibilityState.busy).toBe(true);

    await fireEvent.press(screen.getByTestId("login-google"));
    expect(mockedGetGoogleIdToken).toHaveBeenCalledTimes(1);

    finishGoogleSignIn?.({ type: "cancelled" });
    await waitFor(() =>
      expect(screen.getByTestId("login-google").props.accessibilityState.busy).toBe(false),
    );
  });

  it("keeps Google disabled when the rollout flag is unavailable", async () => {
    mockedIsGoogleSignInAvailable.mockReturnValue(false);

    await render(<LoginScreen />);

    expect(screen.getByTestId("login-google").props.accessibilityState).toEqual({
      busy: false,
      disabled: true,
    });
    await fireEvent.press(screen.getByTestId("login-google"));
    expect(mockedGetGoogleIdToken).not.toHaveBeenCalled();
  });
});
