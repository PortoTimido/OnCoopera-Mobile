import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { MedicalReportScreen } from "@/features/relatorio-medico/screens";
import { getMe } from "@/lib/api/auth";
import { listRegistrosDiarios } from "@/lib/api/diario-sintomas";
import { setMemorySession } from "@/lib/auth/session";

jest.mock("expo-router", () => ({
  ...jest.requireActual("expo-router"),
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock("expo-print", () => ({ printToFileAsync: jest.fn() }));
jest.mock("expo-sharing", () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock("@/lib/api/auth", () => ({ ...jest.requireActual("@/lib/api/auth"), getMe: jest.fn() }));
jest.mock("@/lib/api/diario-sintomas", () => ({ ...jest.requireActual("@/lib/api/diario-sintomas"), listRegistrosDiarios: jest.fn() }));

const mockedGetMe = jest.mocked(getMe);
const mockedListRecords = jest.mocked(listRegistrosDiarios);
const mockedPrint = jest.mocked(Print.printToFileAsync);
const mockedCanShare = jest.mocked(Sharing.isAvailableAsync);
const mockedShare = jest.mocked(Sharing.shareAsync);

describe("medical report screen", () => {
  beforeEach(() => {
    setMemorySession({
      accessToken: "token",
      usuario: { dataNascimento: "1990-01-01", email: "ana@oncoopera.com", id: "user", login: "ana", nome: "Ana Costa", perfisAdministrativos: [], status: "ATIVO", telefone: "11999999999", tipo: "PACIENTE", trocaSenhaObrigatoria: false, ultimoAcesso: null },
    });
    mockedGetMe.mockResolvedValue({ dataNascimento: "1990-01-01", email: "ana@oncoopera.com", id: "user", login: "ana", nome: "Ana Costa", perfisAdministrativos: [], status: "ATIVO", telefone: "11999999999", tipo: "PACIENTE", trocaSenhaObrigatoria: false, ultimoAcesso: null });
    mockedListRecords.mockResolvedValue({
      data: [{ dataHora: "2026-10-13T10:00:00.000Z", dataRegistro: "2026-10-13", humor: "BEM", id: "record-1", sintomas: [{ intensidade: 7, tipo: "FATIGA" }] }],
      page: 1,
      pageSize: 100,
      total: 1,
      totalPages: 1,
    });
    mockedPrint.mockResolvedValue({ numberOfPages: 1, uri: "file:///report.pdf" });
    mockedCanShare.mockResolvedValue(true);
    mockedShare.mockResolvedValue(undefined);
  });

  afterEach(() => {
    setMemorySession(null);
    jest.clearAllMocks();
  });

  it("loads report data, changes the period, and shares a generated PDF", async () => {
    render(<MedicalReportScreen />);

    await waitFor(() => expect(screen.getByTestId("medical-report-symptoms")).toBeTruthy());
    expect(mockedListRecords).toHaveBeenCalledWith({ page: 1, pageSize: 100 }, "token");

    fireEvent.press(screen.getByTestId("medical-report-period-15"));
    expect(screen.getByTestId("medical-report-period-15").props.accessibilityState).toEqual({ checked: true });

    fireEvent.press(screen.getByTestId("medical-report-generate"));
    await waitFor(() => expect(mockedPrint).toHaveBeenCalled());
    expect(mockedShare).toHaveBeenCalledWith("file:///report.pdf", { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
  });

  it("shows a message instead of generating a report for an empty period", async () => {
    mockedListRecords.mockResolvedValue({ data: [], page: 1, pageSize: 100, total: 0, totalPages: 0 });
    render(<MedicalReportScreen />);

    await waitFor(() => expect(screen.getByText("Não há registros no período selecionado para gerar o relatório.")).toBeTruthy());
    expect(screen.getByTestId("medical-report-generate").props.accessibilityState).toEqual({ disabled: true });
  });

  it("shows a load error and keeps PDF generation unavailable", async () => {
    mockedGetMe.mockRejectedValue(new Error("offline"));
    render(<MedicalReportScreen />);

    await waitFor(() => expect(screen.getByText("Não foi possível carregar os dados para o relatório. Tente novamente.")).toBeTruthy());
    expect(screen.getByTestId("medical-report-generate").props.accessibilityState).toEqual({ disabled: true });
  });

  it("logs the failed PDF step and shows the generation error", async () => {
    const failure = new Error("Falha no módulo nativo");
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedPrint.mockRejectedValue(failure);
    try {
      render(<MedicalReportScreen />);
      await waitFor(() => expect(screen.getByTestId("medical-report-generate").props.accessibilityState).toEqual({ disabled: false }));

      fireEvent.press(screen.getByTestId("medical-report-generate"));

      await waitFor(() => expect(screen.getByText("Não foi possível gerar ou compartilhar o PDF. Tente novamente.")).toBeTruthy());
      expect(log).toHaveBeenCalledWith(expect.stringContaining("geração do arquivo PDF"), failure);
      expect(mockedShare).not.toHaveBeenCalled();
    } finally {
      log.mockRestore();
    }
  });
});
