import type { Humor, RegistroDiario, SintomaTipo } from "@/lib/api/diario-sintomas";

const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const MONTH_NAMES_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const HUMOR_OPTIONS: Array<{ emoji: string; label: string; value: Humor }> = [
  { emoji: "😄", label: "Muito bem", value: "MUITO_BEM" },
  { emoji: "🙂", label: "Bem", value: "BEM" },
  { emoji: "😐", label: "Neutro", value: "NEUTRO" },
  { emoji: "😟", label: "Mal", value: "MAL" },
  { emoji: "😣", label: "Muito mal", value: "MUITO_MAL" },
];

export const HUMOR_LABEL: Record<Humor, string> = {
  BEM: "Bem",
  MAL: "Mal",
  MUITO_BEM: "Muito bem",
  MUITO_MAL: "Muito mal",
  NEUTRO: "Neutro",
};

export const SINTOMA_LABEL: Record<SintomaTipo, string> = {
  APETITE: "Apetite",
  DOR: "Dor",
  FATIGA: "Fadiga",
  FEBRE: "Febre",
  NAUSEA: "Náusea",
  OUTRO: "Outro",
  SONO: "Sono",
  TONTURA: "Tontura",
};

export const SINTOMA_ORDER: SintomaTipo[] = ["NAUSEA", "FATIGA", "DOR", "TONTURA", "FEBRE", "SONO", "APETITE", "OUTRO"];

export function formatIntensidade(intensidade: number) {
  return `${Math.round(intensidade)}/10`;
}

function toLocalDate(dateOnly: string) {
  const [year, month, day] = dateOnly.split("-").map(Number);

  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function formatDataRegistroLabel(dataRegistro: string, referenceDate = new Date()) {
  const date = toLocalDate(dataRegistro);
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  const dayMonth = `${date.getDate()} de ${MONTH_NAMES_SHORT[date.getMonth()]}`;

  if (diffDays === 0) return `Hoje, ${dayMonth}`;
  if (diffDays === 1) return `Ontem, ${dayMonth}`;

  return dayMonth;
}

export function formatDataRegistroFull(dataRegistro: string) {
  const date = toLocalDate(dataRegistro);

  return `${WEEKDAY_NAMES[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES_SHORT[date.getMonth()]}`.replace(/^./, (c) =>
    c.toLocaleUpperCase("pt-BR"),
  );
}

export function formatRegistroSummary(registro: Pick<RegistroDiario, "notaVozUrl" | "sintomas">) {
  const parts = registro.sintomas
    .slice(0, 2)
    .map((sintoma) => `${SINTOMA_LABEL[sintoma.tipo]} ${formatIntensidadeLabel(sintoma.intensidade)}`);

  if (registro.notaVozUrl) {
    parts.push("Nota de voz");
  }

  return parts.join(" • ") || "Sem sintomas registrados";
}

function formatIntensidadeLabel(intensidade: number) {
  if (intensidade <= 2) return "leve";
  if (intensidade <= 5) return "moderada";
  if (intensidade <= 8) return "intensa";
  return "insuportável";
}

export function formatRecordingDuration(durationMillis: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
