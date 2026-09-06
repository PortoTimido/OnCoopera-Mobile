import type { Apoio, ApoioHorario, ApoioTipo } from "@/lib/api/apoios";

export const APOIO_TIPO_LABEL: Record<ApoioTipo, string> = {
  CASA_APOIO: "Casa de apoio",
  CLINICA: "Clínica",
  ONG: "ONG",
  PSICOLOGO: "Psicólogo",
  TRANSPORTE: "Transporte",
};

export const APOIO_FILTERS: Array<{ id: "todos" | ApoioTipo; label: string }> = [
  { id: "todos", label: "Todos" },
  ...Object.entries(APOIO_TIPO_LABEL).map(([id, label]) => ({ id: id as ApoioTipo, label })),
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function formatApoioAddress(apoio: Pick<Apoio, "endereco">) {
  const { bairro, cidade, complemento, estado, logradouro, numero } = apoio.endereco;
  const lineOne = `${logradouro}, ${numero}${complemento ? ` - ${complemento}` : ""}`;
  const lineTwo = [bairro, `${cidade} - ${estado}`].filter(Boolean).join(", ");

  return { lineOne, lineTwo };
}

export function formatApoioDistance(distanceKm?: number) {
  if (typeof distanceKm !== "number") return null;

  return `${distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} km`;
}

export function formatApoioSchedule(horarios: ApoioHorario[]) {
  if (horarios.length === 0) return "Horário não informado";

  const ordered = [...horarios].sort((first, second) => first.diaSemana - second.diaSemana);
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  const dayRange = first.diaSemana === last.diaSemana ? WEEK_DAYS[first.diaSemana] : `${WEEK_DAYS[first.diaSemana]} – ${WEEK_DAYS[last.diaSemana]}`;

  return `${dayRange}\n${first.horarioInicio} às ${first.horarioFim}`;
}
