import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { RegisterScreen } from "@/features/auth/screens/RegisterScreen";
import type { AuthResponse } from "@/lib/api/auth";
import { createPatient, login } from "@/lib/api/auth";
import { getAddressByCep } from "@/lib/api/via-cep";
import { saveAuthSession } from "@/lib/auth/session";

jest.mock("@/lib/api/auth", () => {
  const actual = jest.requireActual("@/lib/api/auth");
  return {
    ...actual,
    createPatient: jest.fn(),
    login: jest.fn(),
  };
});

jest.mock("@/lib/api/via-cep", () => ({
  getAddressByCep: jest.fn(),
}));

jest.mock("@/lib/auth/session", () => ({
  saveAuthSession: jest.fn(),
}));

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
}));

const mockedCreatePatient = jest.mocked(createPatient);
const mockedLogin = jest.mocked(login);
const mockedGetAddressByCep = jest.mocked(getAddressByCep);
const mockedSaveAuthSession = jest.mocked(saveAuthSession);

const session: AuthResponse = {
  accessToken: "token",
  usuario: {
    dataNascimento: "1990-01-01",
    email: "maria@oncoopera.com",
    id: "user-id",
    login: "maria.silva",
    nome: "Maria Silva",
    perfisAdministrativos: [],
    status: "ATIVO",
    telefone: "11999999999",
    tipo: "PACIENTE",
    trocaSenhaObrigatoria: false,
    ultimoAcesso: null,
  },
};

async function fillStepOne() {
  await fireEvent.changeText(screen.getByLabelText("Nome completo"), "Maria Silva");
  await fireEvent.changeText(screen.getByLabelText("E-mail"), "maria@oncoopera.com");
  await fireEvent.changeText(screen.getByLabelText("Telefone"), "11999999999");
  await fireEvent.press(screen.getByTestId("cadastro-data-nascimento"));
  await fireEvent.press(screen.getByTestId("cadastro-data-nascimento-confirm"));
  await fireEvent.changeText(screen.getByLabelText("Senha", { exact: true }), "Senha1!");
  await fireEvent.changeText(screen.getByLabelText("Confirmar senha", { exact: true }), "Senha1!");
  await fireEvent.press(screen.getByTestId("cadastro-proximo"));
}

async function fillStepTwo() {
  await fireEvent.changeText(screen.getByLabelText("CEP"), "01001000");
  await waitFor(() => expect(mockedGetAddressByCep).toHaveBeenCalled());
  await fireEvent.changeText(screen.getByLabelText("UF"), "SP");
  await fireEvent.changeText(screen.getByLabelText("Cidade"), "Sao Paulo");
  await fireEvent.changeText(screen.getByLabelText("Bairro"), "Se");
  await fireEvent.changeText(screen.getByLabelText("Endereço"), "Praca da Se");
  await fireEvent.changeText(screen.getByLabelText("Número"), "1");
}

describe("register screen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetAddressByCep.mockResolvedValue({
      bairro: "Se",
      cep: "01001000",
      complemento: "",
      localidade: "Sao Paulo",
      logradouro: "Praca da Se",
      uf: "SP",
    });
  });

  it("logs the user in automatically after a successful registration", async () => {
    mockedCreatePatient.mockResolvedValue(session.usuario);
    mockedLogin.mockResolvedValue(session);

    await render(<RegisterScreen />);

    await fillStepOne();
    await fillStepTwo();

    await fireEvent.press(screen.getByTestId("cadastro-submit"));

    await waitFor(() => expect(mockedCreatePatient).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith({ identificador: "maria@oncoopera.com", senha: "Senha1!" }),
    );
    await waitFor(() => expect(mockedSaveAuthSession).toHaveBeenCalledWith(session, true));
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({ pathname: "/inicio", params: { medicalGuidance: "1" } }),
    );
  });

  it("falls back to a manual login prompt when auto login fails", async () => {
    mockedCreatePatient.mockResolvedValue(session.usuario);
    mockedLogin.mockRejectedValue(new Error("Nao foi possivel entrar."));

    await render(<RegisterScreen />);

    await fillStepOne();
    await fillStepTwo();

    await fireEvent.press(screen.getByTestId("cadastro-submit"));

    await waitFor(() => expect(mockedLogin).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(await screen.findByText("Cadastro enviado com sucesso. Entre com seu e-mail e senha.")).toBeTruthy();
  });
});
