import { Image, Text, View } from "react-native-css/components";

type UserAvatarProps = {
  className?: string;
  initials: string;
  uri?: string | null;
};

export function UserAvatar({ className = "size-8", initials, uri }: UserAvatarProps) {
  if (uri) {
    return <Image accessibilityLabel="Foto de perfil" className={`${className} rounded-pill`} source={{ uri }} />;
  }

  return (
    <View className={`${className} items-center justify-center rounded-pill bg-brand-mint`}>
      <Text className="font-sans-bold text-[10px] leading-[15px] text-brand-primary">{initials}</Text>
    </View>
  );
}
