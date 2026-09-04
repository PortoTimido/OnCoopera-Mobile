import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import {
  ChangePasswordModal,
  EditNameModal,
  SettingsLogoutButton,
  SettingsNotificationsCard,
  SettingsProfileCard,
  SettingsSecurityCard,
  SettingsTopBar,
} from "@/features/settings/components";
import { useSettingsProfile } from "@/features/settings/hooks/use-settings-profile";
import { clearAuthSession } from "@/lib/auth/session";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function SettingsScreen() {
  const router = useRouter();
  const { email, name, setName } = useSettingsProfile();
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  async function handlePasswordChanged() {
    await clearAuthSession();
    router.replace({ pathname: "/login", params: { passwordChanged: "1" } });
  }

  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="flex-1 bg-home-canvas" testID="settings-screen">
        <SettingsTopBar />

        <ScrollView
          className="flex-1 bg-home-canvas"
          contentContainerClassName="mx-auto w-full max-w-home gap-6 px-6 pb-16 pt-8"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <AppText className="text-[30px] leading-[36px] text-home-ink" variant="title">
              Configuracoes
            </AppText>
            <AppText className="text-home-muted">Personalize sua experiencia no OnCoopera.</AppText>
          </View>

          <SettingsProfileCard email={email} name={name} onEditPress={() => setEditNameVisible(true)} />
          <SettingsNotificationsCard />
          <SettingsSecurityCard onChangePasswordPress={() => setChangePasswordVisible(true)} />
          <SettingsLogoutButton />
        </ScrollView>

        <EditNameModal
          name={name}
          onClose={() => setEditNameVisible(false)}
          onNameUpdated={setName}
          visible={editNameVisible}
        />

        <ChangePasswordModal
          onClose={() => setChangePasswordVisible(false)}
          onPasswordChanged={handlePasswordChanged}
          visible={changePasswordVisible}
        />
      </View>
    </SafeAreaView>
  );
}
