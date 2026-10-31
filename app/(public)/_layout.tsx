import { Stack } from "expo-router";

import { PasswordRecoveryProvider } from "@/features/auth/password-recovery-context";

export default function PublicLayout() {
  return (
    <PasswordRecoveryProvider>
      <Stack screenOptions={{ animation: "fade", animationDuration: 220, headerShown: false }} />
    </PasswordRecoveryProvider>
  );
}
