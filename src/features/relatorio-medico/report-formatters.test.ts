import type { RegistroDiario } from "@/lib/api/diario-sintomas";

import { buildMedicalReportHtml, filterRecordsForPeriod, getSymptomMetrics, getReportRange } from "./report-formatters";

const records: RegistroDiario[] = [
  { dataHora: "2026-10-13T10:00:00.000Z", dataRegistro: "2026-10-13", humor: "BEM", id: "1", sintomas: [{ intensidade: 6, tipo: "FATIGA" }, { intensidade: 2, tipo: "NAUSEA" }] },
  { dataHora: "2026-10-12T10:00:00.000Z", dataRegistro: "2026-10-12", humor: "MAL", id: "2", sintomas: [{ intensidade: 7, tipo: "FATIGA" }, { intensidade: 8, tipo: "DOR" }] },
  { dataHora: "2026-10-05T10:00:00.000Z", dataRegistro: "2026-10-05", humor: "NEUTRO", id: "3", sintomas: [{ intensidade: 4, tipo: "DOR" }] },
];

describe("medical report formatters", () => {
  it("uses calendar days including the reference day", () => {
    expect(getReportRange(7, new Date(2026, 9, 13))).toEqual({ end: "2026-10-13", start: "2026-10-07" });
    expect(filterRecordsForPeriod(records, 7, new Date(2026, 9, 13))).toHaveLength(2);
  });

  it("includes both calendar boundaries for every report period", () => {
    const referenceDate = new Date("2026-10-27T12:00:00.000Z");
    const boundaryRecords: RegistroDiario[] = [
      { ...records[0], dataRegistro: "2026-10-27", id: "end" },
      { ...records[0], dataRegistro: "2026-10-21", id: "seven-day-start" },
      { ...records[0], dataRegistro: "2026-10-20", id: "before-seven-day-start" },
      { ...records[0], dataRegistro: "2026-10-13", id: "fifteen-day-start" },
      { ...records[0], dataRegistro: "2026-10-12", id: "before-fifteen-day-start" },
      { ...records[0], dataRegistro: "2026-09-28", id: "thirty-day-start" },
      { ...records[0], dataRegistro: "2026-09-27", id: "before-thirty-day-start" },
    ];

    expect(filterRecordsForPeriod(boundaryRecords, 7, referenceDate).map(({ id }) => id)).toEqual(["end", "seven-day-start"]);
    expect(filterRecordsForPeriod(boundaryRecords, 15, referenceDate).map(({ id }) => id)).toEqual(["end", "seven-day-start", "before-seven-day-start", "fifteen-day-start"]);
    expect(filterRecordsForPeriod(boundaryRecords, 30, referenceDate).map(({ id }) => id)).toEqual([
      "end",
      "seven-day-start",
      "before-seven-day-start",
      "fifteen-day-start",
      "before-fifteen-day-start",
      "thirty-day-start",
    ]);
  });

  it("uses timestamp dates and falls back to dataHora for older records", () => {
    const mixedRecords: RegistroDiario[] = [
      { ...records[0], dataRegistro: "2026-10-13T00:00:00.000Z" },
      { ...records[1], dataRegistro: undefined as unknown as string },
      { ...records[2], dataRegistro: "invalid", dataHora: "invalid" },
    ];

    expect(filterRecordsForPeriod(mixedRecords, 7, new Date("2026-10-13T12:00:00.000Z"))).toEqual(mixedRecords.slice(0, 2));

    const html = buildMedicalReportHtml({ days: 7, generatedAt: new Date("2026-10-13T12:00:00.000Z"), patientName: "Ana", records: mixedRecords.slice(0, 2) });
    expect(html).toContain("13 de outubro de 2026");
    expect(html).toContain("12 de outubro de 2026");
  });

  it("ranks symptoms by frequency and breaks ties with the established symptom order", () => {
    expect(getSymptomMetrics(records.slice(0, 2), 7)).toEqual([
      { daysPresent: 2, percentage: 29, tipo: "FATIGA" },
      { daysPresent: 1, percentage: 14, tipo: "NAUSEA" },
      { daysPresent: 1, percentage: 14, tipo: "DOR" },
    ]);
  });

  it("includes all structured records and excludes voice-note information from PDF HTML", () => {
    const html = buildMedicalReportHtml({ days: 7, generatedAt: new Date(2026, 9, 13), patientName: "Ana <Costa>", records: records.slice(0, 2) });

    expect(html).toContain("Ana &lt;Costa&gt;");
    expect(html).toContain("Fadiga: 6/10");
    expect(html).toContain("Humor:</strong> Bem");
    expect(html).not.toContain("nota de voz");
  });
});
