import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native-css/components";

import { logout } from "@/lib/api/auth";
import { clearAuthSession } from "@/lib/auth/session";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function SettingsLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await logout();
    } catch {
      // A sessao local e encerrada mesmo que a chamada ao backend falhe.
    } finally {
      await clearAuthSession();
      router.replace("/login");
    }
  }

  return (
    <Pressable
      accessibilityLabel="Sair da conta"
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading }}
      className="min-h-14 flex-row items-center justify-center gap-2 rounded-pill bg-feedback-danger-soft px-6"
      disabled={loading}
      onPress={handleLogout}
      testID="settings-logout"
    >
      {loading ? (
        <ActivityIndicator color={nativePropColors.danger} />
      ) : (
        <LogOut color={nativePropColors.danger} size={18} strokeWidth={2.2} />
      )}
      <Text className="font-sans-bold text-[15px] leading-[20px] text-feedback-danger">Sair da conta</Text>
    </Pressable>
  );
}
