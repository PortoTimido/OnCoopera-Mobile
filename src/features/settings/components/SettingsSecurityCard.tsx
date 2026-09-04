import { ChevronRight, FileText, Info, Lock, ShieldCheck } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type SettingsSecurityCardProps = {
  onChangePasswordPress: () => void;
};

export function SettingsSecurityCard({ onChangePasswordPress }: SettingsSecurityCardProps) {
  const securityItems: Array<{ icon: IconComponent; id: string; label: string; onPress?: () => void }> = [
    { icon: Lock, id: "alterar-senha", label: "Alterar senha", onPress: onChangePasswordPress },
    { icon: ShieldCheck, id: "privacidade-dados", label: "Privacidade de dados" },
    { icon: FileText, id: "termos-uso", label: "Termos de uso" },
    { icon: Info, id: "politica-privacidade", label: "Politica de privacidade" },
  ];

  return (
    <View className="gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay">
      <AppText className="text-[16px] leading-[22px] text-home-ink" variant="subtitle">
        Privacidade e Seguranca
      </AppText>

      <View className="gap-3">
        {securityItems.map((item) => {
          const Icon = item.icon;
          const disabled = !item.onPress;

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              className="min-h-12 flex-row items-center gap-3 rounded-2xl bg-home-canvas px-4"
              disabled={disabled}
              key={item.id}
              onPress={item.onPress}
              testID={`settings-${item.id}`}
            >
              <Icon color={nativePropColors.homeMuted} size={18} strokeWidth={2} />
              <Text className="flex-1 font-sans-medium text-[14px] leading-[20px] text-home-ink">{item.label}</Text>
              <ChevronRight color={nativePropColors.homeNavText} size={18} strokeWidth={2.2} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
