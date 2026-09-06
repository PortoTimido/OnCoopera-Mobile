import type { Apoio } from "@/lib/api/apoios";

import { APOIO_TIPO_LABEL, formatApoioAddress, formatApoioDistance, formatApoioSchedule } from "../radar-apoio-formatters";
import { getRadarMapMarkers } from "../radar-map-markers";

const apoio: Apoio = {
  dataAtualizacao: "2026-01-01T00:00:00.000Z",
  dataCriacao: "2026-01-01T00:00:00.000Z",
  descricao: "Acolhimento",
  distanciaKm: 1.2,
  endereco: { bairro: "Centro", cep: "01000-000", cidade: "São Paulo", complemento: null, estado: "SP", latitude: -23.55, logradouro: "Rua Teste", longitude: -46.63, numero: "35" },
  estaAbertoAgora: true,
  horarios: [{ diaSemana: 1, horarioFim: "18:00", horarioInicio: "08:00" }, { diaSemana: 5, horarioFim: "18:00", horarioInicio: "08:00" }],
  id: "apoio-1",
  imagensUrl: [],
  nome: "INCA",
  status: "ATIVO",
  telefone: "(11) 3000-0000",
  tipoApoio: "CLINICA",
};

describe("radar apoio presentation helpers", () => {
  it("formats labels, address, distance and schedule in Portuguese", () => {
    expect(APOIO_TIPO_LABEL.CLINICA).toBe("Clínica");
    expect(formatApoioAddress(apoio)).toEqual({ lineOne: "Rua Teste, 35", lineTwo: "Centro, São Paulo - SP" });
    expect(formatApoioDistance(1.2)).toBe("1,2 km");
    expect(formatApoioSchedule(apoio.horarios)).toBe("Seg – Sex\n08:00 às 18:00");
  });

  it("creates a fallback marker when coordinates cannot define a map area", () => {
    expect(getRadarMapMarkers([{ ...apoio, endereco: { ...apoio.endereco, latitude: 0, longitude: 0 } }])).toEqual([
      { id: "apoio-1", left: 72, top: 56 },
    ]);
  });
});
