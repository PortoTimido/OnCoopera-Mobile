import { Annoyed, BatteryLow, Moon, Plus, Thermometer, Utensils, Wind, Zap } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native-css/components";

import type { SintomaTipo } from "@/lib/api/diario-sintomas";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { SINTOMA_LABEL, SINTOMA_ORDER } from "../diario-sintomas-formatters";

type IconComponent = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const SINTOMA_ICON: Record<SintomaTipo, IconComponent> = {
  APETITE: Utensils,
  DOR: Zap,
  FATIGA: BatteryLow,
  FEBRE: Thermometer,
  NAUSEA: Annoyed,
  OUTRO: Plus,
  SONO: Moon,
  TONTURA: Wind,
};

type DiarioSymptomGridProps = {
  onToggle: (tipo: SintomaTipo) => void;
  selected: Partial<Record<SintomaTipo, unknown>>;
};

export function DiarioSymptomGrid({ onToggle, selected }: DiarioSymptomGridProps) {
  return (
    <View className="flex-row flex-wrap gap-3" testID="diario-symptom-grid">
      {SINTOMA_ORDER.map((tipo) => {
        const Icon = SINTOMA_ICON[tipo];
        const isSelected = Boolean(selected[tipo]);

        return (
          <Pressable
            accessibilityLabel={`Sintoma ${SINTOMA_LABEL[tipo]}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            className={cn(
              "w-[23%] min-w-[72px] items-center gap-1.5 rounded-2xl border-2 py-3",
              isSelected ? "border-brand-primary bg-brand-soft" : "border-home-border bg-home-canvas",
            )}
            key={tipo}
            onPress={() => onToggle(tipo)}
            testID={`diario-symptom-${tipo}`}
          >
            <Icon color={isSelected ? nativePropColors.brandPrimary : nativePropColors.homeMuted} size={20} strokeWidth={2.2} />
            <Text
              className={cn(
                "font-sans-bold text-[10px] leading-[13px] uppercase",
                isSelected ? "text-brand-primary" : "text-home-muted",
              )}
            >
              {SINTOMA_LABEL[tipo]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
