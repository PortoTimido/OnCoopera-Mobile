import { Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type HomeTopBarProps = {
  dateLabel: string;
  initials: string;
};

export function HomeTopBar({ dateLabel, initials }: HomeTopBarProps) {
  return (
    <View className="h-[66px] flex-row items-center justify-between border-b border-home-border bg-home-surface px-4">
      <View className="flex-row items-center gap-3">
        <View className="size-8 items-center justify-center rounded-pill bg-brand-mint">
          <Text className="font-sans-bold text-[10px] leading-[15px] text-brand-primary">{initials}</Text>
        </View>

        <View>
          <AppText className="text-[24px] leading-[30px] text-brand-primary" variant="title">
            Inicio
          </AppText>
          <Text className="font-sans text-[12px] leading-[16px] text-home-muted">{dateLabel}</Text>
        </View>
      </View>

      <Pressable
        accessibilityLabel="Adicionar"
        accessibilityRole="button"
        className="size-8 items-center justify-center rounded-pill bg-brand-mint"
        hitSlop={8}
      >
        <Plus color={nativePropColors.brandPrimary} size={22} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
