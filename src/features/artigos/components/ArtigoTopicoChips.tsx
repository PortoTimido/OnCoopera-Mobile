import { Pressable, ScrollView, Text } from "react-native-css/components";

import type { ArtigoTopico } from "@/features/artigos/hooks/use-artigos";
import { cn } from "@/lib/cn";

type ArtigoTopicoChipsProps = {
  onSelect: (id: string) => void;
  selectedId: string;
  topicos: ArtigoTopico[];
};

export function ArtigoTopicoChips({ onSelect, selectedId, topicos }: ArtigoTopicoChipsProps) {
  return (
    <ScrollView
      contentContainerClassName="flex-row items-center gap-2"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {topicos.map((topico) => {
        const active = topico.id === selectedId;

        return (
          <Pressable
            accessibilityLabel={topico.nome}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            className={cn(
              "min-h-10 items-center justify-center rounded-pill border px-5",
              active ? "border-brand-primary bg-brand-primary" : "border-transparent bg-home-border/60",
            )}
            key={topico.id}
            onPress={() => onSelect(topico.id)}
            testID={`artigo-topico-${topico.id}`}
          >
            <Text className={cn("font-sans-bold text-[13px] leading-[18px]", active ? "text-white" : "text-home-muted")}>
              {topico.nome}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
