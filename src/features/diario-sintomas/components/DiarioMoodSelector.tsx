import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import type { Humor } from "@/lib/api/diario-sintomas";
import { cn } from "@/lib/cn";

import { HUMOR_OPTIONS } from "../diario-sintomas-formatters";

type DiarioMoodSelectorProps = {
  onSelect: (humor: Humor) => void;
  value: Humor | null;
};

export function DiarioMoodSelector({ onSelect, value }: DiarioMoodSelectorProps) {
  return (
    <View className="gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay" testID="diario-mood-selector">
      <AppText className="text-[17px] leading-[22px] text-home-ink" variant="subtitle">
        Como você está hoje?
      </AppText>
      <View className="flex-row justify-between">
        {HUMOR_OPTIONS.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              accessibilityLabel={option.label}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              className={cn(
                "size-12 items-center justify-center rounded-pill border-2",
                selected ? "border-brand-primary bg-brand-soft" : "border-home-border bg-home-canvas",
              )}
              key={option.value}
              onPress={() => onSelect(option.value)}
              testID={`diario-mood-${option.value}`}
            >
              <Text className="text-[22px] leading-[26px]">{option.emoji}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
