import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { ForgotPasswordScreen } from "@/features/auth/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "@/features/auth/screens/ResetPasswordScreen";
import { VerifyPasswordRecoveryCodeScreen } from "@/features/auth/screens/VerifyPasswordRecoveryCodeScreen";
import {
  requestPatientPasswordRecovery,
  resetPatientPasswordWithRecoveryToken,
  verifyPatientPasswordRecoveryCode,
} from "@/lib/api/auth";

jest.mock("@/lib/api/auth", () => {
  const actual = jest.requireActual("@/lib/api/auth");
  return {
    ...actual,
    requestPatientPasswordRecovery: jest.fn(),
    resetPatientPasswordWithRecoveryToken: jest.fn(),
    verifyPatientPasswordRecoveryCode: jest.fn(),
  };
});

const mockUsePasswordRecovery = jest.fn();

jest.mock("@/features/auth/password-recovery-context", () => ({
  usePasswordRecovery: () => mockUsePasswordRecovery(),
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

const mockedRequestRecovery = jest.mocked(requestPatientPasswordRecovery);
const mockedResetPassword = jest.mocked(resetPatientPasswordWithRecoveryToken);
const mockedVerifyCode = jest.mocked(verifyPatientPasswordRecoveryCode);

describe("password recovery screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("requests a code and advances to verification", async () => {
    const startRecovery = jest.fn();
    mockUsePasswordRecovery.mockReturnValue({ startRecovery });
    mockedRequestRecovery.mockResolvedValue({ message: "Código enviado." });

    await render(<ForgotPasswordScreen />);

    await fireEvent.changeText(screen.getByTestId("forgot-email"), " paciente@oncoopera.com ");
    await fireEvent.press(screen.getByTestId("forgot-submit"));

    await waitFor(() =>
      expect(mockedRequestRecovery).toHaveBeenCalledWith({ email: "paciente@oncoopera.com" }),
    );
    expect(startRecovery).toHaveBeenCalledWith("paciente@oncoopera.com");
    expect(mockPush).toHaveBeenCalledWith("/verificar-codigo-recuperacao");
  });

  it("validates the code and keeps the recovery token outside route parameters", async () => {
    const storeResetToken = jest.fn();
    mockUsePasswordRecovery.mockReturnValue({ email: "paciente@oncoopera.com", startRecovery: jest.fn(), storeResetToken });
    mockedVerifyCode.mockResolvedValue({ resetToken: "short-lived-token" });

    await render(<VerifyPasswordRecoveryCodeScreen />);

    await fireEvent.changeText(screen.getByTestId("recovery-code"), "483921");
    await fireEvent.press(screen.getByTestId("recovery-code-submit"));

    await waitFor(() =>
      expect(mockedVerifyCode).toHaveBeenCalledWith({ code: "483921", email: "paciente@oncoopera.com" }),
    );
    expect(storeResetToken).toHaveBeenCalledWith("short-lived-token");
    expect(mockPush).toHaveBeenCalledWith("/redefinir-senha");
  });

  it("resends the recovery code for the active email", async () => {
    const startRecovery = jest.fn();
    mockUsePasswordRecovery.mockReturnValue({ email: "paciente@oncoopera.com", startRecovery, storeResetToken: jest.fn() });
    mockedRequestRecovery.mockResolvedValue({ message: "Código enviado." });

    await render(<VerifyPasswordRecoveryCodeScreen />);

    await fireEvent.press(screen.getByTestId("recovery-code-resend"));

    await waitFor(() =>
      expect(mockedRequestRecovery).toHaveBeenCalledWith({ email: "paciente@oncoopera.com" }),
    );
    expect(startRecovery).toHaveBeenCalledWith("paciente@oncoopera.com");
    expect(screen.getByText("Se o e-mail estiver cadastrado, um novo código foi enviado.")).toBeTruthy();
  });

  it("resets the password with the in-memory token and clears recovery state", async () => {
    const clearRecovery = jest.fn();
    mockUsePasswordRecovery.mockReturnValue({ clearRecovery, resetToken: "short-lived-token" });
    mockedResetPassword.mockResolvedValue(undefined);

    await render(<ResetPasswordScreen />);

    await fireEvent.changeText(screen.getByTestId("reset-password"), "SenhaNova!123");
    await fireEvent.changeText(screen.getByTestId("reset-password-confirm"), "SenhaNova!123");
    await fireEvent.press(screen.getByTestId("reset-submit"));

    await waitFor(() =>
      expect(mockedResetPassword).toHaveBeenCalledWith({
        newPassword: "SenhaNova!123",
        passwordConfirmation: "SenhaNova!123",
        resetToken: "short-lived-token",
      }),
    );
    expect(clearRecovery).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("returns to the beginning when there is no recovery state", async () => {
    mockUsePasswordRecovery.mockReturnValue({ email: null, resetToken: null });

    await render(<VerifyPasswordRecoveryCodeScreen />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/esqueci-senha"));
  });
});
