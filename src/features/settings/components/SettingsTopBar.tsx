import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function SettingsTopBar() {
  const router = useRouter();

  return (
    <View className="h-[56px] flex-row items-center gap-3 border-b border-home-border bg-home-surface px-4">
      <Pressable
        accessibilityLabel="Voltar"
        accessibilityRole="button"
        className="size-8 items-center justify-center"
        hitSlop={8}
        onPress={() => router.back()}
        testID="settings-back"
      >
        <ArrowLeft color={nativePropColors.brandPrimary} size={22} strokeWidth={2.4} />
      </Pressable>

      <AppText className="text-[18px] leading-[24px] text-brand-primary" variant="subtitle">
        OnCoopera
      </AppText>
    </View>
  );
}
