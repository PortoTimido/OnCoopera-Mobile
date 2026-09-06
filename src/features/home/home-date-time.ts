const BRASILIA_UTC_OFFSET_HOURS = 3;

const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function toBrasiliaDate(date: Date) {
  return new Date(date.getTime() - BRASILIA_UTC_OFFSET_HOURS * 60 * 60 * 1000);
}

function getBrasiliaHour(date: Date) {
  return toBrasiliaDate(date).getUTCHours();
}

export function formatBrasiliaDateTime(date = new Date()) {
  const brasiliaDate = toBrasiliaDate(date);
  const weekday = WEEKDAY_NAMES[brasiliaDate.getUTCDay()];
  const day = brasiliaDate.getUTCDate().toString();
  const month = MONTH_NAMES[brasiliaDate.getUTCMonth()];

  return `${weekday}, ${day} DE ${month}`.toLocaleUpperCase("pt-BR");
}

export function getBrasiliaGreeting(date = new Date()) {
  const hour = getBrasiliaHour(date);

  if (hour >= 18 || hour < 3) {
    return { emoji: "🌙", label: "Boa noite" };
  }

  if (hour >= 12) {
    return { emoji: "🌤️", label: "Boa tarde" };
  }

  return { emoji: "☀️", label: "Bom dia" };
}
