import { Mail } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { AuthButton, AuthCard, AuthHeader, AuthLink, AuthShell, AuthTextField } from "@/features/auth/components";
import { usePasswordRecovery } from "@/features/auth/password-recovery-context";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { validateEmailRequest } from "@/features/auth/validation";
import { requestPatientPasswordRecovery } from "@/lib/api/auth";

export function ForgotPasswordScreen() {
  const router = useRouter();
  const { startRecovery } = usePasswordRecovery();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const nextError = validateEmailRequest(email);
    setError(nextError);
    setMessage(null);

    if (nextError) {
      return;
    }

    const normalizedEmail = email.trim();
    setLoading(true);

    try {
      await requestPatientPasswordRecovery({ email: normalizedEmail });
      startRecovery(normalizedEmail);
      router.push("/verificar-codigo-recuperacao");
    } catch (submitError) {
      setMessage(getSubmitErrorMessage(submitError, "Não foi possível enviar o código agora."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell testID="esqueci-senha-screen">
      <AuthHeader subtitle="Informe seu e-mail para preparar a recuperação." title="Esqueci minha senha" />

      <AuthCard>
        <FormMessage
          message="Se o e-mail estiver cadastrado, você receberá um código de 6 dígitos para redefinir sua senha."
          tone="info"
        />
        <FormMessage message={message} />

        <AuthTextField
          error={error}
          icon={Mail}
          keyboardType="email-address"
          label="E-mail cadastrado"
          onChangeText={(value) => {
            setEmail(value);
            setError(undefined);
          }}
          placeholder="seu@email.com"
          testID="forgot-email"
          value={email}
        />

        <AuthButton loading={loading} onPress={handleSubmit} testID="forgot-submit" title="Enviar código" />

        <View className="items-center gap-1">
          <AuthLink href="/login" label="Voltar para login" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
