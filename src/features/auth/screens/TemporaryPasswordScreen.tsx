import { Mail } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import {
  AuthButton,
  AuthCard,
  AuthHeader,
  AuthLink,
  AuthShell,
  AuthTextField,
  PasswordChecklist,
  PasswordField,
} from "@/features/auth/components";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import {
  hasFieldErrors,
  type FieldErrors,
  type TemporaryPasswordFormValues,
  validateTemporaryPassword,
} from "@/features/auth/validation";
import { changeTemporaryPassword } from "@/lib/api/auth";

export function TemporaryPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identificador?: string }>();
  const [values, setValues] = useState<TemporaryPasswordFormValues>({
    confirmarSenha: "",
    identificador: params.identificador ?? "",
    novaSenha: "",
    senhaTemporaria: "",
  });
  const [errors, setErrors] = useState<FieldErrors<TemporaryPasswordFormValues>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateField(field: keyof TemporaryPasswordFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  }

  async function handleSubmit() {
    const nextErrors = validateTemporaryPassword(values);
    setErrors(nextErrors);
    setMessage(null);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      await changeTemporaryPassword({
        identificador: values.identificador.trim(),
        novaSenha: values.novaSenha,
        senhaTemporaria: values.senhaTemporaria,
      });
      router.replace({ pathname: "/login", params: { temporaryPasswordChanged: "1" } });
    } catch (error) {
      setMessage(getSubmitErrorMessage(error, "Nao foi possivel trocar a senha temporaria."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell testID="trocar-senha-temporaria-screen">
      <AuthHeader subtitle="Crie sua senha definitiva para liberar o acesso." title="Trocar senha temporaria" />

      <AuthCard>
        <FormMessage message={message} />

        <AuthTextField
          error={errors.identificador}
          icon={Mail}
          keyboardType="email-address"
          label="E-mail ou login"
          onChangeText={(value) => updateField("identificador", value)}
          placeholder="seu@email.com"
          testID="temporary-identificador"
          value={values.identificador}
        />

        <PasswordField
          error={errors.senhaTemporaria}
          label="Senha temporaria"
          onChangeText={(value) => updateField("senhaTemporaria", value)}
          placeholder="Senha recebida"
          testID="temporary-current-password"
          value={values.senhaTemporaria}
        />

        <PasswordField
          error={errors.novaSenha}
          label="Nova senha"
          onChangeText={(value) => updateField("novaSenha", value)}
          placeholder="Senha definitiva"
          testID="temporary-new-password"
          value={values.novaSenha}
        />

        <PasswordChecklist password={values.novaSenha} />

        <PasswordField
          error={errors.confirmarSenha}
          label="Confirmar senha"
          onChangeText={(value) => updateField("confirmarSenha", value)}
          placeholder="Repita a senha"
          testID="temporary-confirm-password"
          value={values.confirmarSenha}
        />

        <AuthButton loading={loading} onPress={handleSubmit} testID="temporary-submit" title="Salvar senha" />

        <View className="items-center">
          <AuthLink href="/login" label="Voltar para login" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
