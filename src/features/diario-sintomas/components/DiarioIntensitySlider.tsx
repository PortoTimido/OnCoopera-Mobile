import Slider from "@react-native-community/slider";
import { Text, TextInput, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import type { SintomaTipo } from "@/lib/api/diario-sintomas";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { SINTOMA_LABEL } from "../diario-sintomas-formatters";

type DiarioIntensitySliderProps = {
  descricaoOutro?: string;
  intensidade: number;
  onChangeDescricaoOutro?: (value: string) => void;
  onChangeIntensidade: (value: number) => void;
  tipo: SintomaTipo;
};

export function DiarioIntensitySlider({
  descricaoOutro,
  intensidade,
  onChangeDescricaoOutro,
  onChangeIntensidade,
  tipo,
}: DiarioIntensitySliderProps) {
  return (
    <View className="gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay" testID="diario-intensity-slider">
      <AppText className="text-[17px] leading-[22px] text-home-ink" variant="subtitle">
        {`Intensidade da ${SINTOMA_LABEL[tipo]}`}
      </AppText>

      <Slider
        accessibilityLabel={`Intensidade da ${SINTOMA_LABEL[tipo]}`}
        maximumTrackTintColor="#e5e0d5"
        maximumValue={10}
        minimumTrackTintColor={nativePropColors.brandPrimary}
        minimumValue={0}
        onValueChange={onChangeIntensidade}
        step={1}
        testID={`diario-intensity-slider-${tipo}`}
        thumbTintColor={nativePropColors.brandPrimary}
        value={intensidade}
      />

      <View className="flex-row items-center justify-between">
        <Text className="font-sans-bold text-[11px] uppercase leading-[14px] text-home-muted">Nenhuma</Text>
        <Text className="font-sans-bold text-[13px] leading-[16px] text-brand-primary">{Math.round(intensidade)}/10</Text>
        <Text className="font-sans-bold text-[11px] uppercase leading-[14px] text-home-muted">Insuportável</Text>
      </View>

      {tipo === "OUTRO" ? (
        <TextInput
          accessibilityLabel="Descreva o sintoma"
          className="min-h-11 rounded-2xl border border-home-border bg-home-canvas px-4 font-sans text-[14px] text-home-ink"
          maxLength={120}
          onChangeText={onChangeDescricaoOutro}
          placeholder="Descreva o que você sentiu"
          placeholderTextColor={nativePropColors.homeMuted}
          testID="diario-symptom-outro-description"
          value={descricaoOutro ?? ""}
        />
      ) : null}
    </View>
  );
}
