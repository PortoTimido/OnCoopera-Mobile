import { Link } from "expo-router";
import { ArrowRight, CircleCheck, Clock3 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { articleToneClasses, articleToneColors, getArtigoCategoryTone } from "@/features/artigos/artigo-category-tone";
import type { Artigo } from "@/lib/api/artigos";
import { cn } from "@/lib/cn";

type ArtigoCardProps = {
  artigo: Artigo;
};

export function ArtigoCard({ artigo }: ArtigoCardProps) {
  const categoriaNome = artigo.categorias[0]?.nome ?? "Geral";
  const tone = getArtigoCategoryTone(categoriaNome);
  const toneClasses = articleToneClasses[tone];
  const inkColor = articleToneColors[tone];

  return (
    <Link asChild href={{ params: { id: artigo.id }, pathname: "/artigos/[id]" }}>
      <Pressable
        accessibilityLabel={artigo.titulo}
        accessibilityRole="button"
        className={cn("gap-4 rounded-home-card p-6 shadow-home-clay", toneClasses.card)}
        testID={`artigo-card-${artigo.id}`}
      >
        <View className="flex-row items-center justify-between">
          <View className={cn("rounded-pill px-3 py-1.5", toneClasses.badge)}>
            <Text className={cn("font-sans-bold text-[11px] leading-[14px]", toneClasses.ink)}>
              {categoriaNome.toLocaleUpperCase("pt-BR")}
            </Text>
          </View>

          <View className={cn("flex-row items-center gap-1 rounded-pill px-3 py-1.5", toneClasses.badge)}>
            <CircleCheck color={inkColor} size={12} strokeWidth={2.4} />
            <Text className={cn("font-sans-bold text-[11px] leading-[14px]", toneClasses.ink)}>Revisado</Text>
          </View>
        </View>

        <AppText className={cn("text-[22px] leading-[28px]", toneClasses.ink)} variant="title">
          {artigo.titulo}
        </AppText>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            <Clock3 color={inkColor} size={14} strokeWidth={2.2} />
            <Text className={cn("font-sans text-[13px] leading-[18px]", toneClasses.ink)}>
              {artigo.tempoLeituraMinutos} min leitura
            </Text>
          </View>

          <ArrowRight color={inkColor} size={20} strokeWidth={2.4} />
        </View>
      </Pressable>
    </Link>
  );
}
