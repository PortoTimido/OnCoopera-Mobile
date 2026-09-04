import { Pencil, User } from "lucide-react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type SettingsProfileCardProps = {
  email: string;
  name: string;
  onEditPress: () => void;
};

export function SettingsProfileCard({ email, name, onEditPress }: SettingsProfileCardProps) {
  return (
    <View className="flex-row items-center gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay">
      <View className="size-14 items-center justify-center rounded-pill bg-home-canvas">
        <User color={nativePropColors.homeMuted} size={24} strokeWidth={2} />
      </View>

      <View className="flex-1 gap-0.5">
        <AppText className="text-[16px] leading-[22px] text-home-ink" variant="subtitle">
          {name}
        </AppText>
        <Text className="font-sans text-[13px] leading-[18px] text-home-muted">{email}</Text>
      </View>

      <Pressable
        accessibilityLabel="Editar perfil"
        accessibilityRole="button"
        className="size-10 items-center justify-center rounded-pill bg-home-canvas"
        hitSlop={8}
        onPress={onEditPress}
        testID="settings-edit-profile"
      >
        <Pencil color={nativePropColors.homeMuted} size={16} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
