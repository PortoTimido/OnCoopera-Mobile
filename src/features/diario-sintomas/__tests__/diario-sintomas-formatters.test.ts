import {
  formatDataRegistroLabel,
  formatDataRegistroFull,
  formatIntensidade,
  formatRecordingDuration,
  formatRegistroSummary,
  getBrasiliaCalendarDate,
  getRegistroDate,
} from "@/features/diario-sintomas/diario-sintomas-formatters";

describe("diario sintomas formatters", () => {
  it("labels today and yesterday relative to a reference date", () => {
    const reference = new Date(2024, 6, 15);

    expect(formatDataRegistroLabel("2024-07-15", reference)).toBe("Hoje, 15 de jul");
    expect(formatDataRegistroLabel("2024-07-14", reference)).toBe("Ontem, 14 de jul");
    expect(formatDataRegistroLabel("2024-07-13", reference)).toBe("13 de jul");
  });

  it("uses the timestamp when a record has no date-only field", () => {
    const date = getRegistroDate({ dataHora: "2024-07-14T10:00:00.000Z", dataRegistro: undefined as unknown as string });

    expect(formatDataRegistroLabel(date, new Date(2024, 6, 15))).toBe("Ontem, 14 de jul");
    expect(formatDataRegistroFull(date)).toBe("Domingo, 14 de jul");
  });

  it("keeps a UTC midnight date on its calendar day in Brasília", () => {
    const date = getRegistroDate({ dataHora: "2026-10-13T21:00:00.000Z", dataRegistro: "2026-10-13T00:00:00.000Z" });

    expect(formatDataRegistroFull(date)).toBe("Terça, 13 de out");
    expect(formatDataRegistroLabel(date, new Date(2026, 9, 13))).toBe("Hoje, 13 de out");
    expect(getBrasiliaCalendarDate(new Date("2026-10-14T01:00:00.000Z")).getDate()).toBe(13);
    expect(getBrasiliaCalendarDate(new Date("2026-10-14T03:00:00.000Z")).getDate()).toBe(14);
  });

  it("does not render NaN or undefined for an invalid date", () => {
    expect(formatDataRegistroLabel(undefined)).toBe("Data indisponível");
    expect(formatDataRegistroFull("invalid")).toBe("Data indisponível");
  });

  it("formats an intensity score out of ten", () => {
    expect(formatIntensidade(7)).toBe("7/10");
  });

  it("summarizes a registro's symptoms and voice note", () => {
    const summary = formatRegistroSummary({
      notaVozUrl: "https://example.com/audio.m4a",
      sintomas: [
        { intensidade: 6, tipo: "FATIGA" },
        { intensidade: 8, tipo: "APETITE" },
      ],
    });

    expect(summary).toBe("Fadiga intensa • Apetite intensa • Nota de voz");
  });

  it("falls back to a placeholder when there are no symptoms", () => {
    expect(formatRegistroSummary({ notaVozUrl: null, sintomas: [] })).toBe("Sem sintomas registrados");
  });

  it("formats a recording duration as minutes and seconds", () => {
    expect(formatRecordingDuration(65_000)).toBe("1:05");
    expect(formatRecordingDuration(5_000)).toBe("0:05");
  });
});
