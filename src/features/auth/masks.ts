import { normalizeDigits } from "@/features/auth/validation";

export function formatPhoneBR(rawValue: string) {
  const digits = normalizeDigits(rawValue).slice(0, 11);

  if (!digits) {
    return "";
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) {
    return `(${ddd}) ${rest}`;
  }

  const splitIndex = digits.length <= 10 ? 4 : 5;
  const middle = rest.slice(0, splitIndex);
  const last = rest.slice(splitIndex);

  return `(${ddd}) ${middle}-${last}`;
}

export function formatCepBR(rawValue: string) {
  const digits = normalizeDigits(rawValue).slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatDateBR(isoDate: string) {
  const [year, month, day] = isoDate.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
}
