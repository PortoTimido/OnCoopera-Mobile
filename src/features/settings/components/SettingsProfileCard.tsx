import { Camera, Pencil } from "lucide-react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText, UserAvatar } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type SettingsProfileCardProps = {
  email: string;
  initials: string;
  avatarUri?: string | null;
  hasAvatar?: boolean;
  isUploadingAvatar?: boolean;
  name: string;
  onAvatarPress: () => void;
  onEditPress: () => void;
  onRemoveAvatarPress: () => void;
};

export function SettingsProfileCard({
  avatarUri,
  email,
  hasAvatar = false,
  initials,
  isUploadingAvatar = false,
  name,
  onAvatarPress,
  onEditPress,
  onRemoveAvatarPress,
}: SettingsProfileCardProps) {
  return (
    <View className="relative flex-row items-center gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay">
      <View className="relative">
        <UserAvatar className="size-14" initials={initials} uri={avatarUri} />
        <Pressable
          accessibilityLabel="Alterar foto de perfil"
          accessibilityRole="button"
          className="absolute -bottom-1 -right-1 size-6 items-center justify-center rounded-pill bg-home-canvas"
          disabled={isUploadingAvatar}
          onPress={onAvatarPress}
        >
          <Camera color={nativePropColors.homeMuted} size={13} strokeWidth={2.3} />
        </Pressable>
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

      {hasAvatar ? (
        <Pressable
          accessibilityLabel="Remover foto de perfil"
          accessibilityRole="button"
          className="absolute bottom-2 left-5"
          disabled={isUploadingAvatar}
          onPress={onRemoveAvatarPress}
        >
          <Text className="font-sans text-[11px] text-home-muted">Remover foto</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
