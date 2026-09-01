import { CheckCircle2 } from "lucide-react-native";
import { View } from "react-native-css/components";

import { AppText, FormMessage } from "@/components/ui";
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
            A etapa visual de senha atualizada esta pronta para receber a integracao definitiva de recuperacao.
          </AppText>
        </View>

        <FormMessage message="Endpoint de recuperacao por token ainda nao esta disponivel no OpenAPI atual." tone="info" />

        <AuthButton onPress={() => router.replace("/login")} title="Entrar" />
      </AuthCard>
    </AuthShell>
  );
}
