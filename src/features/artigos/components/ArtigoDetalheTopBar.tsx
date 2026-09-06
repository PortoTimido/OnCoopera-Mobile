import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native-css/components";

import { nativePropColors } from "@/lib/design/native-prop-colors";

export function ArtigoDetalheTopBar() {
  const router = useRouter();

  return (
    <View className="h-[56px] flex-row items-center border-b border-home-border bg-home-surface px-4">
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        className="size-9 items-center justify-center rounded-pill border border-home-border bg-home-surface"
        hitSlop={8}
        onPress={() => router.back()}
        testID="artigo-detalhe-back"
      >
        <ArrowLeft color={nativePropColors.brandPrimary} size={20} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}
