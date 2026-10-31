import { CheckCircle2 } from "lucide-react-native";
import { View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { AuthButton, AuthCard, AuthHeader, AuthShell } from "@/features/auth/components";
import { nativePropColors } from "@/lib/design/native-prop-colors";
import { useRouter } from "expo-router";

export function PasswordUpdatedScreen() {
  const router = useRouter();

  return (
    <AuthShell testID="senha-atualizada-screen">
      <AuthHeader title="Senha atualizada" />

      <AuthCard className="items-center">
        <View className="size-20 items-center justify-center rounded-full bg-feedback-success-soft">
          <CheckCircle2 color={nativePropColors.success} size={42} strokeWidth={2.1} />
        </View>

        <View className="items-center gap-2">
          <AppText className="text-center" variant="title">
            Tudo certo
          </AppText>
          <AppText className="text-center">
            Sua senha foi redefinida com sucesso. Entre com sua nova senha para continuar.
          </AppText>
        </View>

        <AuthButton onPress={() => router.replace("/login")} title="Entrar" />
      </AuthCard>
    </AuthShell>
  );
}
