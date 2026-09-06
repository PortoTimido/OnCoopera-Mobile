import { Search } from "lucide-react-native";
import { TextInput, View } from "react-native-css/components";

import { nativePropColors } from "@/lib/design/native-prop-colors";

type ArtigoSearchInputProps = {
  onChangeText: (value: string) => void;
  value: string;
};

export function ArtigoSearchInput({ onChangeText, value }: ArtigoSearchInputProps) {
  return (
    <View className="h-12 flex-row items-center gap-3 rounded-pill bg-home-surface px-5 shadow-home-soft">
      <Search color={nativePropColors.homeMuted} size={18} strokeWidth={2.2} />
      <TextInput
        accessibilityLabel="Pesquisar artigos"
        className="min-h-12 flex-1 py-0 font-sans text-[14px] leading-[20px] text-home-ink"
        onChangeText={onChangeText}
        placeholder="Pesquisar..."
        placeholderTextColor={nativePropColors.homeMuted}
        testID="artigos-search-input"
        value={value}
      />
    </View>
  );
}
