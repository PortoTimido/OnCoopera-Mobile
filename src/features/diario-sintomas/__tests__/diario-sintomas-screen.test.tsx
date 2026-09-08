import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { DiarioSintomasScreen } from "@/features/diario-sintomas/screens";
import { ApiError } from "@/lib/api/client";
import { getRegistroDiarioHoje, listRegistrosDiarios, saveRegistroDiarioHoje } from "@/lib/api/diario-sintomas";
import { setMemorySession } from "@/lib/auth/session";

jest.mock("@/lib/api/diario-sintomas", () => {
  const actual = jest.requireActual("@/lib/api/diario-sintomas");
  return {
    ...actual,
    getRegistroDiarioHoje: jest.fn(),
    listRegistrosDiarios: jest.fn(),
    saveRegistroDiarioHoje: jest.fn(),
  };
});

jest.mock("@/features/home/hooks/use-home-clock", () => ({ useHomeClock: () => ({ dateTimeLabel: "QUARTA, 15 DE JULHO" }) }));
jest.mock("@/features/home/hooks/use-home-user", () => ({ useHomeUser: () => ({ initials: "PP" }) }));

jest.mock("expo-audio", () => ({
  getRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestRecordingPermissionsAsync: jest.fn(async () => ({ granted: true })),
  RecordingPresets: { HIGH_QUALITY: {} },
  setAudioModeAsync: jest.fn(async () => undefined),
  useAudioPlayer: jest.fn(() => ({ pause: jest.fn(), play: jest.fn() })),
  useAudioPlayerStatus: jest.fn(() => ({ duration: 0, playing: false })),
  useAudioRecorder: jest.fn(() => ({ pause: jest.fn(), prepareToRecordAsync: jest.fn(async () => undefined), record: jest.fn(), stop: jest.fn(async () => undefined), uri: null })),
  useAudioRecorderState: jest.fn(() => ({ canRecord: true, durationMillis: 0, isRecording: false, mediaServicesDidReset: false, url: null })),
}));

jest.mock("expo-file-system", () => ({ File: jest.fn().mockImplementation(() => ({ delete: jest.fn() })) }));

jest.mock("@react-native-community/slider", () => {
  const { View } = jest.requireActual("react-native");
  return { __esModule: true, default: View };
});

const mockedGetRegistroDiarioHoje = jest.mocked(getRegistroDiarioHoje);
const mockedListRegistrosDiarios = jest.mocked(listRegistrosDiarios);
const mockedSaveRegistroDiarioHoje = jest.mocked(saveRegistroDiarioHoje);

describe("diario sintomas screen", () => {
  beforeEach(() => {
    setMemorySession({
      accessToken: "token",
      usuario: {
        dataNascimento: "1990-01-01",
        email: "paciente@oncoopera.com",
        id: "user",
        login: "paciente",
        nome: "Paciente",
        perfisAdministrativos: [],
        status: "ATIVO",
        telefone: "11999999999",
        tipo: "PACIENTE",
        trocaSenhaObrigatoria: false,
        ultimoAcesso: null,
      },
    });
    mockedGetRegistroDiarioHoje.mockRejectedValue(new ApiError(404, "not found"));
    mockedListRegistrosDiarios.mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 });
  });

  afterEach(() => {
    setMemorySession(null);
    jest.clearAllMocks();
  });

  it("lets the patient select a mood, a symptom and save today's entry", async () => {
    mockedSaveRegistroDiarioHoje.mockResolvedValue({
      dataHora: "2024-07-15T10:00:00.000Z",
      dataRegistro: "2024-07-15",
      humor: "BEM",
      id: "registro-1",
      notaVozUrl: null,
      sintomas: [{ intensidade: 5, tipo: "DOR" }],
    });

    render(<DiarioSintomasScreen />);

    await waitFor(() => expect(screen.getByTestId("diario-mood-selector")).toBeTruthy());

    fireEvent.press(screen.getByTestId("diario-mood-BEM"));
    fireEvent.press(screen.getByTestId("diario-symptom-DOR"));

    await waitFor(() => expect(screen.getByTestId("diario-intensity-slider")).toBeTruthy());

    fireEvent.press(screen.getByTestId("diario-save-button"));

    await waitFor(() =>
      expect(mockedSaveRegistroDiarioHoje).toHaveBeenCalledWith(
        expect.objectContaining({ humor: "BEM", sintomas: [expect.objectContaining({ intensidade: 5, tipo: "DOR" })] }),
        "token",
      ),
    );
  });

  it("shows an empty state message when there is no history yet", async () => {
    render(<DiarioSintomasScreen />);

    await waitFor(() => expect(screen.getByText("Você ainda não tem registros anteriores.")).toBeTruthy());
  });
});
