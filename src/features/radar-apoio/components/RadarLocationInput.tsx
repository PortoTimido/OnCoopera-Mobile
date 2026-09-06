import { MapPin, Search } from "lucide-react-native";
import { TextInput, View } from "react-native-css/components";

import { nativePropColors } from "@/lib/design/native-prop-colors";

type RadarLocationInputProps = {
  onChangeText: (value: string) => void;
  value: string;
};

export function RadarLocationInput({ onChangeText, value }: RadarLocationInputProps) {
  return (
    <View className="min-h-[72px] flex-row items-center gap-4 rounded-pill border-2 border-radar-info-border bg-white px-6 shadow-home-soft">
      <MapPin color={nativePropColors.brandPrimary} size={21} strokeWidth={3} />
      <TextInput
        accessibilityLabel="Cidade para buscar apoios"
        className="flex-1 font-sans-semibold text-[16px] text-home-ink"
        onChangeText={onChangeText}
        placeholder="Informe sua cidade"
        placeholderTextColor={nativePropColors.homeMuted}
        returnKeyType="search"
        value={value}
      />
      <Search color={nativePropColors.homeMuted} size={21} strokeWidth={2.5} />
    </View>
  );
}
