import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { TermsAcceptanceScreen } from "@/features/documentos-legais/screens/TermsAcceptanceScreen";
import { acceptTermsOfUse } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getLegalDocument } from "@/lib/api/documentos-legais";
import { clearPendingTermsAcceptance, getPendingTermsAcceptance, saveAuthSession } from "@/lib/auth/session";

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/lib/api/auth", () => ({ acceptTermsOfUse: jest.fn() }));
jest.mock("@/lib/api/documentos-legais", () => ({ getLegalDocument: jest.fn() }));
jest.mock("@/lib/auth/session", () => ({
  clearPendingTermsAcceptance: jest.fn(),
  getPendingTermsAcceptance: jest.fn(),
  saveAuthSession: jest.fn(),
}));

const mockReplace = jest.fn();
const pending = {
  aceiteTermosUsoPendente: true as const,
  remember: true,
  tokenAceite: "restricted-token",
  usuario: {
    dataNascimento: "1990-01-01", email: "ana@oncoopera.com", id: "user-id", login: "ana", nome: "Ana",
    perfisAdministrativos: [], status: "ATIVO" as const, telefone: "11999999999", tipo: "PACIENTE" as const,
    trocaSenhaObrigatoria: false, ultimoAcesso: null,
  },
};

describe("terms acceptance screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getPendingTermsAcceptance).mockResolvedValue(pending);
    jest.mocked(getLegalDocument).mockResolvedValue({
      atualizadoEm: "2026-11-02T00:00:00.000Z", conteudo: "<p>Termos vigentes</p>", id: "terms-id", tipo: "TERMOS_USO", versao: "1.0",
    });
  });

  it("keeps acceptance disabled until the terms have been fully scrolled", async () => {
    await render(<TermsAcceptanceScreen />);
    const submit = await screen.findByTestId("terms-acceptance-submit");
    expect(submit.props.accessibilityState.disabled).toBe(true);

    fireEvent.scroll(screen.getByTestId("terms-acceptance-scroll"), {
      nativeEvent: { contentOffset: { y: 100 }, contentSize: { height: 200 }, layoutMeasurement: { height: 100 } },
    });

    await waitFor(() => expect(screen.getByTestId("terms-acceptance-submit").props.accessibilityState.disabled).toBe(false));
  });

  it("creates the normal session only after the backend confirms acceptance", async () => {
    jest.mocked(acceptTermsOfUse).mockResolvedValue({ accessToken: "session-token" });
    await render(<TermsAcceptanceScreen />);
    await screen.findByTestId("terms-acceptance-submit");
    fireEvent.scroll(screen.getByTestId("terms-acceptance-scroll"), {
      nativeEvent: { contentOffset: { y: 100 }, contentSize: { height: 200 }, layoutMeasurement: { height: 100 } },
    });
    await waitFor(() => expect(screen.getByTestId("terms-acceptance-submit").props.accessibilityState.disabled).toBe(false));
    await fireEvent.press(screen.getByTestId("terms-acceptance-submit"));

    await waitFor(() => expect(saveAuthSession).toHaveBeenCalledWith({ accessToken: "session-token", usuario: pending.usuario }, true));
    expect(clearPendingTermsAcceptance).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/inicio", params: { medicalGuidance: "1" } });
  });

  it("discards an expired temporary token and returns to login", async () => {
    jest.mocked(acceptTermsOfUse).mockRejectedValue(new ApiError(401, "Não autorizado."));
    await render(<TermsAcceptanceScreen />);
    await screen.findByTestId("terms-acceptance-submit");
    fireEvent.scroll(screen.getByTestId("terms-acceptance-scroll"), {
      nativeEvent: { contentOffset: { y: 100 }, contentSize: { height: 200 }, layoutMeasurement: { height: 100 } },
    });
    await waitFor(() => expect(screen.getByTestId("terms-acceptance-submit").props.accessibilityState.disabled).toBe(false));
    await fireEvent.press(screen.getByTestId("terms-acceptance-submit"));

    await waitFor(() => expect(clearPendingTermsAcceptance).toHaveBeenCalled());
    expect(mockReplace).toHaveBeenCalledWith({ pathname: "/login", params: { termsMessage: "Seu acesso para aceite expirou. Entre novamente." } });
    expect(saveAuthSession).not.toHaveBeenCalled();
  });
});
