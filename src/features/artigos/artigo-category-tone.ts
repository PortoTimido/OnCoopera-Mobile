import { nativePropColors } from "@/lib/design/native-prop-colors";

export type ArtigoTone = "blue" | "gold" | "purple" | "teal";

export const articleToneClasses: Record<ArtigoTone, { badge: string; card: string; ink: string }> = {
  blue: { badge: "bg-white/55", card: "bg-article-blue", ink: "text-article-blue-ink" },
  gold: { badge: "bg-white/55", card: "bg-article-gold", ink: "text-article-gold-ink" },
  purple: { badge: "bg-white/55", card: "bg-article-purple", ink: "text-article-purple-ink" },
  teal: { badge: "bg-white/55", card: "bg-article-teal", ink: "text-article-teal-ink" },
};

export const articleToneColors: Record<ArtigoTone, string> = {
  blue: nativePropColors.articleBlueInk,
  gold: nativePropColors.articleGoldInk,
  purple: nativePropColors.articlePurpleInk,
  teal: nativePropColors.articleTealInk,
};

const TONE_ORDER: ArtigoTone[] = ["purple", "teal", "gold", "blue"];

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

export function getArtigoCategoryTone(categoryName: string): ArtigoTone {
  const normalized = categoryName.trim().toLocaleLowerCase("pt-BR");

  if (normalized.includes("mindful") || normalized.includes("mindset") || normalized.includes("emocional")) {
    return "purple";
  }

  if (normalized.includes("nutri") || normalized.includes("alimenta")) {
    return "teal";
  }

  if (normalized.includes("cognit") || normalized.includes("chemo brain")) {
    return "gold";
  }

  return TONE_ORDER[hashString(normalized) % TONE_ORDER.length];
}
