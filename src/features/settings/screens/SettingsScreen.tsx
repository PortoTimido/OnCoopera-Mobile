import { useRouter } from "expo-router";
import { File } from "expo-file-system";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View } from "react-native-css/components";
import * as ImagePicker from "expo-image-picker";

import { AppText, FormMessage } from "@/components/ui";
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
import { deleteOwnImage, uploadOwnImage } from "@/lib/api/auth";
import { clearAuthSession, getAccessToken, updateMemorySessionUser } from "@/lib/auth/session";
import { cacheUserAvatarFromFile, clearCachedUserAvatar } from "@/lib/auth/user-avatar-cache";
import { nativePropColors } from "@/lib/design/native-prop-colors";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";

export function SettingsScreen() {
  const router = useRouter();
  const { avatarUri, email, initials, name, setName, setProfile, user } = useSettingsProfile();
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  async function handlePasswordChanged() {
    await clearAuthSession();
    router.replace({ pathname: "/login", params: { passwordChanged: "1" } });
  }

  async function uploadAvatar(source: "camera" | "library") {
    setAvatarMessage(null);

    const permission = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setAvatarMessage(source === "camera" ? "Permita o acesso à câmera para tirar uma foto." : "Permita o acesso às fotos para escolher uma imagem.");
      return;
    }

    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], mediaTypes: ["images"], quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], mediaTypes: ["images"], quality: 0.85 });

    if (result.canceled || !result.assets[0] || !user) {
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const normalizedImage = await manipulateAsync(result.assets[0].uri, [], {
        compress: 0.85,
        format: SaveFormat.JPEG,
      });
      const image = new File(normalizedImage.uri);
      const updatedUser = await uploadOwnImage(image, await requireAccessToken());
      await cacheUserAvatarFromFile(updatedUser.id, normalizedImage.uri);
      updateMemorySessionUser(updatedUser);
      setProfile(updatedUser);
    } catch (error) {
      setAvatarMessage(getSubmitErrorMessage(error, "Não foi possível atualizar a foto."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function handleAvatarPress() {
    Alert.alert("Foto de perfil", "Escolha como deseja atualizar sua foto.", [
      { text: "Tirar foto", onPress: () => void uploadAvatar("camera") },
      { text: "Escolher da galeria", onPress: () => void uploadAvatar("library") },
      { style: "cancel", text: "Cancelar" },
    ]);
  }

  function handleRemoveAvatarPress() {
    if (!user) return;

    Alert.alert("Remover foto", "Deseja remover sua foto de perfil?", [
      { style: "cancel", text: "Cancelar" },
      {
        style: "destructive",
        text: "Remover",
        onPress: () => void removeAvatar(),
      },
    ]);
  }

  async function removeAvatar() {
    if (!user) return;

    setAvatarMessage(null);
    setIsUploadingAvatar(true);
    try {
      await deleteOwnImage(await requireAccessToken());
      clearCachedUserAvatar(user.id);
      const updatedUser = { ...user, imagemUrl: null };
      updateMemorySessionUser(updatedUser);
      setProfile(updatedUser);
    } catch (error) {
      setAvatarMessage(getSubmitErrorMessage(error, "Não foi possível remover a foto."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function requireAccessToken() {
    const token = await getAccessToken();
    if (!token) throw new Error("Sessão expirada. Entre novamente.");
    return token;
  }

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
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
              Configurações
            </AppText>
            <AppText className="text-home-muted">Personalize sua experiencia no OnCoopera.</AppText>
          </View>

          <FormMessage message={avatarMessage} />
          <SettingsProfileCard
            avatarUri={avatarUri}
            email={email}
            hasAvatar={Boolean(user?.imagemUrl)}
            initials={initials}
            isUploadingAvatar={isUploadingAvatar}
            name={name}
            onAvatarPress={handleAvatarPress}
            onEditPress={() => setEditNameVisible(true)}
            onRemoveAvatarPress={handleRemoveAvatarPress}
          />
          <SettingsNotificationsCard />
          <SettingsSecurityCard
            onChangePasswordPress={() => setChangePasswordVisible(true)}
            onPrivacyPolicyPress={() => router.push("/documentos-legais/POLITICA_PRIVACIDADE")}
            onTermsOfUsePress={() => router.push("/documentos-legais/TERMOS_USO")}
          />
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
