import { HeartPulse } from "lucide-react-native";
import { View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type AuthHeaderProps = {
  subtitle?: string;
  title?: string;
};

export function AuthHeader({ subtitle, title }: AuthHeaderProps) {
  return (
    <View className="items-center gap-4">
      <View className="size-16 items-center justify-center rounded-[22px] bg-brand-soft shadow-soft elevation-sm">
        <HeartPulse color={nativePropColors.brandPrimary} size={34} strokeWidth={2.25} />
      </View>

      <View className="items-center gap-1">
        <AppText className="text-center text-brand-primary" variant="display">
          OnCoopera
        </AppText>
        {title ? (
          <AppText className="text-center text-auth-ink" variant="subtitle">
            {title}
          </AppText>
        ) : null}
        {subtitle ? <AppText className="max-w-[310px] text-center">{subtitle}</AppText> : null}
      </View>
    </View>
  );
}
