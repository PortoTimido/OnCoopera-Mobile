import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import {
  AuthButton,
  AuthCard,
  AuthHeader,
  AuthLink,
  AuthShell,
  PasswordChecklist,
  PasswordField,
} from "@/features/auth/components";
import {
  hasFieldErrors,
  type FieldErrors,
  type ResetPasswordFormValues,
  validateResetPassword,
} from "@/features/auth/validation";

const initialValues: ResetPasswordFormValues = {
  confirmarSenha: "",
  novaSenha: "",
};

export function ResetPasswordScreen() {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<ResetPasswordFormValues>>({});
  const [message, setMessage] = useState<string | null>(null);

  function updateField(field: keyof ResetPasswordFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  }

  function handleSubmit() {
    const nextErrors = validateResetPassword(values);
    setErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    router.push("/redefinir-senha/sucesso");
  }

  return (
    <AuthShell testID="redefinir-senha-screen">
      <AuthHeader subtitle="Defina uma senha forte para voltar com tranquilidade." title="Criar nova senha" />

      <AuthCard>
        <FormMessage message={message} tone="warning" />

        <PasswordField
          error={errors.novaSenha}
          label="Nova senha"
          onChangeText={(value) => updateField("novaSenha", value)}
          placeholder="Digite a nova senha"
          testID="reset-password"
          value={values.novaSenha}
        />

        <PasswordChecklist password={values.novaSenha} />

        <PasswordField
          error={errors.confirmarSenha}
          label="Confirmar nova senha"
          onChangeText={(value) => updateField("confirmarSenha", value)}
          placeholder="Repita a nova senha"
          testID="reset-password-confirm"
          value={values.confirmarSenha}
        />

        <AuthButton onPress={handleSubmit} testID="reset-submit" title="Atualizar senha" />

        <View className="items-center">
          <AuthLink href="/login" label="Voltar para login" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
