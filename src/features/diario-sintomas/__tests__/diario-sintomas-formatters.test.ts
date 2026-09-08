import {
  formatDataRegistroLabel,
  formatIntensidade,
  formatRecordingDuration,
  formatRegistroSummary,
} from "@/features/diario-sintomas/diario-sintomas-formatters";

describe("diario sintomas formatters", () => {
  it("labels today and yesterday relative to a reference date", () => {
    const reference = new Date(2024, 6, 15);

    expect(formatDataRegistroLabel("2024-07-15", reference)).toBe("Hoje, 15 de jul");
    expect(formatDataRegistroLabel("2024-07-14", reference)).toBe("Ontem, 14 de jul");
    expect(formatDataRegistroLabel("2024-07-13", reference)).toBe("13 de jul");
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
