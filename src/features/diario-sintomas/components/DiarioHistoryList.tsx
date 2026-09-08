import { Link, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import type { Humor, RegistroDiario } from "@/lib/api/diario-sintomas";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { formatDataRegistroLabel, formatRegistroSummary, HUMOR_OPTIONS } from "../diario-sintomas-formatters";

const HUMOR_SURFACE: Record<Humor, string> = {
  BEM: "bg-feedback-success-soft",
  MAL: "bg-feedback-warning-soft",
  MUITO_BEM: "bg-feedback-success-soft",
  MUITO_MAL: "bg-feedback-danger-soft",
  NEUTRO: "bg-home-canvas",
};

const HUMOR_EMOJI: Record<Humor, string> = Object.fromEntries(HUMOR_OPTIONS.map((option) => [option.value, option.emoji])) as Record<
  Humor,
  string
>;

function DiarioHistoryCard({ registro }: { registro: RegistroDiario }) {
  return (
    <Link asChild href={`/diario/${registro.id}` as Href}>
      <Pressable
        accessibilityLabel={`Abrir registro de ${formatDataRegistroLabel(registro.dataRegistro)}`}
        accessibilityRole="button"
        className="min-h-[76px] flex-row items-center gap-4 rounded-home-card border border-home-border bg-home-surface px-5 py-4"
        testID={`diario-history-item-${registro.id}`}
      >
        <View className={cn("size-11 items-center justify-center rounded-pill", HUMOR_SURFACE[registro.humor])}>
          <Text className="text-[20px] leading-[24px]">{HUMOR_EMOJI[registro.humor]}</Text>
        </View>
        <View className="flex-1 gap-0.5">
          <AppText className="text-[15px] leading-[20px] text-home-ink" variant="subtitle">
            {formatDataRegistroLabel(registro.dataRegistro)}
          </AppText>
          <Text className="font-sans text-[13px] leading-[18px] text-home-muted" numberOfLines={1}>
            {formatRegistroSummary(registro)}
          </Text>
        </View>
        <ChevronRight color={nativePropColors.homeMuted} size={18} strokeWidth={2.2} />
      </Pressable>
    </Link>
  );
}

type DiarioHistoryListProps = {
  registros: RegistroDiario[];
};

export function DiarioHistoryList({ registros }: DiarioHistoryListProps) {
  if (registros.length === 0) {
    return (
      <AppText className="py-4 text-center text-home-muted" variant="body">
        Você ainda não tem registros anteriores.
      </AppText>
    );
  }

  return (
    <View className="gap-3" testID="diario-history-list">
      {registros.map((registro) => (
        <DiarioHistoryCard key={registro.id} registro={registro} />
      ))}
    </View>
  );
}
