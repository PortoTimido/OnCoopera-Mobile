import type { RegistroDiario, SintomaTipo } from "@/lib/api/diario-sintomas";
import { getBrasiliaCalendarDate, getRegistroDate, HUMOR_LABEL, SINTOMA_LABEL, SINTOMA_ORDER } from "@/features/diario-sintomas/diario-sintomas-formatters";

export const REPORT_PERIODS = [
  { days: 7, label: "Última semana" },
  { days: 15, label: "Últimos 15 dias" },
  { days: 30, label: "Último mês" },
] as const;

export type ReportPeriodDays = (typeof REPORT_PERIODS)[number]["days"];

export type SymptomReportMetric = {
  daysPresent: number;
  percentage: number;
  tipo: SintomaTipo;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toLocalDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function getRecordDateKey(record: RegistroDiario) {
  const date = getRegistroDate(record);
  return date ? toDateKey(date) : null;
}

export function getReportRange(days: ReportPeriodDays, referenceDate = new Date()) {
  const end = getBrasiliaCalendarDate(referenceDate);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  return { end: toDateKey(end), start: toDateKey(start) };
}

export function filterRecordsForPeriod(records: RegistroDiario[], days: ReportPeriodDays, referenceDate = new Date()) {
  const { end, start } = getReportRange(days, referenceDate);

  return records.filter((record) => {
    const dateKey = getRecordDateKey(record);
    return dateKey !== null && dateKey >= start && dateKey <= end;
  });
}

export function getSymptomMetrics(records: RegistroDiario[], days: ReportPeriodDays): SymptomReportMetric[] {
  const occurrenceCount = new Map<SintomaTipo, number>();

  for (const record of records) {
    for (const symptom of record.sintomas) {
      occurrenceCount.set(symptom.tipo, (occurrenceCount.get(symptom.tipo) ?? 0) + 1);
    }
  }

  return SINTOMA_ORDER.filter((tipo) => occurrenceCount.has(tipo))
    .map((tipo) => {
      const daysPresent = occurrenceCount.get(tipo) ?? 0;

      return { daysPresent, percentage: Math.round((daysPresent / days) * 100), tipo };
    })
    .sort((a, b) => b.daysPresent - a.daysPresent || SINTOMA_ORDER.indexOf(a.tipo) - SINTOMA_ORDER.indexOf(b.tipo));
}

export function formatReportDate(value: Date | string | null) {
  const date = typeof value === "string" ? toLocalDate(value) : value;
  if (!date || Number.isNaN(date.getTime())) return "Data indisponível";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" };
    return entities[character] ?? character;
  });
}

export function buildMedicalReportHtml({ days, patientName, records, generatedAt = new Date() }: { days: ReportPeriodDays; generatedAt?: Date; patientName: string; records: RegistroDiario[] }) {
  const range = getReportRange(days, generatedAt);
  const metrics = getSymptomMetrics(records, days);
  const sortedRecords = [...records].sort((a, b) => (getRecordDateKey(a) ?? "").localeCompare(getRecordDateKey(b) ?? ""));
  const symptomSummary = metrics.length
    ? metrics.map((metric) => `<li><strong>${escapeHtml(SINTOMA_LABEL[metric.tipo])}</strong>: ${metric.daysPresent} dia(s) (${metric.percentage}% do período)</li>`).join("")
    : "<li>Nenhum sintoma foi registrado no período.</li>";
  const dailyRecords = sortedRecords.length
    ? sortedRecords
        .map(
          (record) => `<section class="record"><h3>${escapeHtml(formatReportDate(getRegistroDate(record)))}</h3><p><strong>Humor:</strong> ${escapeHtml(HUMOR_LABEL[record.humor])}</p><ul>${record.sintomas.map((symptom) => `<li>${escapeHtml(SINTOMA_LABEL[symptom.tipo])}: ${symptom.intensidade}/10${symptom.tipo === "OUTRO" && symptom.descricaoOutro ? ` — ${escapeHtml(symptom.descricaoOutro)}` : ""}</li>`).join("")}</ul></section>`,
        )
        .join("")
    : "<p>Nenhum registro diário foi encontrado neste período.</p>";

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><style>@page { margin: 28px; } body { color: #1b1c19; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.45; } h1, h2 { color: #006b5a; } h1 { font-size: 24px; margin: 0 0 6px; } h2 { border-bottom: 1px solid #c9f4ea; font-size: 16px; margin-top: 24px; padding-bottom: 5px; } h3 { color: #006b5a; font-size: 14px; margin-bottom: 4px; } .meta { color: #52615c; } .record { break-inside: avoid; border-bottom: 1px solid #e5e0d5; padding: 8px 0; } p { margin: 4px 0; } ul { margin: 6px 0; padding-left: 20px; }</style></head><body><h1>Relatório Médico</h1><p class="meta">Paciente: ${escapeHtml(patientName)}</p><p class="meta">Período: ${escapeHtml(formatReportDate(range.start))} a ${escapeHtml(formatReportDate(range.end))}</p><h2>Resumo de sintomas</h2><ul>${symptomSummary}</ul><h2>Registros diários</h2>${dailyRecords}</body></html>`;
}
