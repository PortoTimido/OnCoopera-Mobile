import { render, screen, waitFor } from "@testing-library/react-native";

import { RadarApoioDetailScreen } from "@/features/radar-apoio/screens";
import { getApoioById } from "@/lib/api/apoios";

jest.mock("expo-router", () => ({ router: { back: jest.fn() }, useLocalSearchParams: () => ({ id: "apoio-1" }) }));
jest.mock("@/lib/api/apoios", () => ({ getApoioById: jest.fn() }));

const mockedGetApoioById = jest.mocked(getApoioById);

describe("radar apoio detail screen", () => {
  it("shows support information and keeps directions disabled until map integration", async () => {
    mockedGetApoioById.mockResolvedValue({
      dataAtualizacao: "2026-01-01T00:00:00.000Z",
      dataCriacao: "2026-01-01T00:00:00.000Z",
      descricao: "Acolhimento",
      endereco: { bairro: "Centro", cep: "01000-000", cidade: "São Paulo", complemento: null, estado: "SP", latitude: -23.55, logradouro: "Rua Teste", longitude: -46.63, numero: "35" },
      estaAbertoAgora: true,
      horarios: [{ diaSemana: 1, horarioFim: "18:00", horarioInicio: "08:00" }],
      id: "apoio-1",
      imagensUrl: [],
      nome: "INCA",
      status: "ATIVO",
      telefone: "(11) 3000-0000",
      tipoApoio: "CLINICA",
    });

    render(<RadarApoioDetailScreen />);

    await waitFor(() => expect(screen.getByText("INCA")).toBeTruthy());
    expect(mockedGetApoioById).toHaveBeenCalledWith("apoio-1");
    expect(screen.getByText("Rua Teste, 35\nCentro, São Paulo - SP")).toBeTruthy();
    expect(screen.getByText("(11) 3000-0000")).toBeTruthy();
    expect(screen.getByTestId("radar-directions-button").props.accessibilityState).toEqual({ disabled: true });
  });
});
