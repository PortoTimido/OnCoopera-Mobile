import { Pressable, ScrollView, Text } from "react-native-css/components";

import type { ApoioTipo } from "@/lib/api/apoios";
import { cn } from "@/lib/cn";

import { APOIO_FILTERS } from "../radar-apoio-formatters";

type RadarTypeFiltersProps = {
  onSelect: (type: ApoioTipo | "todos") => void;
  selectedType: ApoioTipo | "todos";
};

export function RadarTypeFilters({ onSelect, selectedType }: RadarTypeFiltersProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-6">
      {APOIO_FILTERS.map((filter) => {
        const selected = filter.id === selectedType;
        return (
          <Pressable
            accessibilityLabel={`Filtrar por ${filter.label}`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={cn(
              "min-h-11 items-center justify-center rounded-pill border-2 px-6",
              selected ? "border-brand-mint bg-brand-mint" : "border-radar-info-border bg-radar-chip",
            )}
            key={filter.id}
            onPress={() => onSelect(filter.id)}
            testID={`radar-filter-${filter.id}`}
          >
            <Text className={cn("font-sans-bold text-[14px] leading-[20px]", selected ? "text-brand-primary" : "text-radar-chip-ink")}>
              {filter.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
