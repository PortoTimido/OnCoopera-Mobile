import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { AuthButton, AuthCard, AuthHeader, AuthShell, PasswordChecklist, PasswordField } from "@/features/auth/components";
import { usePasswordRecovery } from "@/features/auth/password-recovery-context";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import {
  hasFieldErrors,
  type FieldErrors,
  type ResetPasswordFormValues,
  validateResetPassword,
} from "@/features/auth/validation";
import { resetPatientPasswordWithRecoveryToken } from "@/lib/api/auth";

const initialValues: ResetPasswordFormValues = {
  confirmarSenha: "",
  novaSenha: "",
};

export function ResetPasswordScreen() {
  const router = useRouter();
  const { clearRecovery, resetToken } = usePasswordRecovery();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<ResetPasswordFormValues>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      router.replace("/esqueci-senha");
    }
  }, [resetToken, router]);

  if (!resetToken) {
    return null;
  }

  const recoveryToken = resetToken;

  function updateField(field: keyof ResetPasswordFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  }

  async function handleSubmit() {
    const nextErrors = validateResetPassword(values);
    setErrors(nextErrors);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      await resetPatientPasswordWithRecoveryToken({
        newPassword: values.novaSenha,
        passwordConfirmation: values.confirmarSenha,
        resetToken: recoveryToken,
      });
      clearRecovery();
      router.replace("/login");
    } catch (submitError) {
      setMessage(getSubmitErrorMessage(submitError, "Não foi possível atualizar sua senha agora."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell testID="redefinir-senha-screen">
      <AuthHeader subtitle="Defina uma senha forte para voltar com tranquilidade." title="Criar nova senha" />

      <AuthCard>
        <FormMessage message={message} />

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

        <AuthButton loading={loading} onPress={handleSubmit} testID="reset-submit" title="Atualizar senha" />

        <View className="items-center">
          <AuthButton
            onPress={() => {
              clearRecovery();
              router.replace("/login");
            }}
            title="Voltar para login"
            variant="ghost"
          />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
