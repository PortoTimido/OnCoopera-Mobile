import { Mail } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { AuthButton, AuthCard, AuthHeader, AuthLink, AuthShell, AuthTextField } from "@/features/auth/components";
import { validateEmailRequest } from "@/features/auth/validation";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit() {
    const nextError = validateEmailRequest(email);
    setError(nextError);
    setMessage(null);

    if (nextError) {
      return;
    }

    setMessage("Fluxo de recuperacao validado. O envio real depende do endpoint de recuperacao no OpenAPI.");
  }

  return (
    <AuthShell testID="esqueci-senha-screen">
      <AuthHeader subtitle="Informe seu e-mail para preparar a recuperacao." title="Esqueci minha senha" />

      <AuthCard>
        <FormMessage message={message} tone="info" />

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

        <AuthButton onPress={handleSubmit} testID="forgot-submit" title="Continuar" />

        <View className="items-center gap-1">
          <AuthLink href="/redefinir-senha" label="Tenho um token de redefinicao" />
          <AuthLink href="/login" label="Voltar para login" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
