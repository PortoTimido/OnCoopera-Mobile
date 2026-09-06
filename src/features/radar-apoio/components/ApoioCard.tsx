import { Link, type Href } from "expo-router";
import { Brain, BusFront, HandHeart, Hospital, House } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import type { Apoio, ApoioTipo } from "@/lib/api/apoios";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { APOIO_TIPO_LABEL, formatApoioDistance } from "../radar-apoio-formatters";

type IconComponent = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const typeAppearance: Record<ApoioTipo, { icon: IconComponent; surface: string }> = {
  CASA_APOIO: { icon: House, surface: "bg-radar-transport" },
  CLINICA: { icon: Hospital, surface: "bg-radar-clinic" },
  ONG: { icon: HandHeart, surface: "bg-radar-ong" },
  PSICOLOGO: { icon: Brain, surface: "bg-radar-psychologist" },
  TRANSPORTE: { icon: BusFront, surface: "bg-radar-transport" },
};

export function ApoioCard({ apoio }: { apoio: Apoio }) {
  const appearance = typeAppearance[apoio.tipoApoio];
  const Icon = appearance.icon;
  const distance = formatApoioDistance(apoio.distanciaKm);

  return (
    <Link asChild href={`/apoios/${apoio.id}` as Href}>
      <Pressable accessibilityLabel={`Abrir ${apoio.nome}`} accessibilityRole="button" className="min-h-[112px] flex-row items-center gap-4 rounded-home-card border-2 border-radar-info-border bg-radar-sheet px-6 py-5 shadow-home-clay">
        <View className={cn("size-14 items-center justify-center rounded-pill", appearance.surface)}>
          <Icon color={nativePropColors.brandPrimary} size={25} strokeWidth={2.4} />
        </View>
        <View className="flex-1 gap-1">
          <AppText className="text-[19px] leading-[24px] text-home-ink" variant="subtitle">{apoio.nome}</AppText>
          <Text className="font-sans text-[14px] leading-[19px] text-home-muted">{APOIO_TIPO_LABEL[apoio.tipoApoio]}</Text>
        </View>
        {distance ? <View className="rounded-pill bg-brand-soft px-3 py-1"><Text className="font-sans-bold text-[12px] text-brand-primary">{distance}</Text></View> : null}
      </Pressable>
    </Link>
  );
}
