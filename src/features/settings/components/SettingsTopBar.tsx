import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, View } from "react-native-css/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function SettingsTopBar() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="h-[56px] flex-row items-center gap-3 border-b border-home-border bg-home-surface px-4" style={{ height: 56 + insets.top, paddingTop: insets.top }}>
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
