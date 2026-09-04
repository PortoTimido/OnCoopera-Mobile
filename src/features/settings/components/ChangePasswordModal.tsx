import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { AuthButton, PasswordChecklist, PasswordField } from "@/features/auth/components";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { hasFieldErrors, type FieldErrors, validateResetPassword } from "@/features/auth/validation";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { changePassword } from "@/lib/api/auth";
import { getAccessToken } from "@/lib/auth/session";

type ChangePasswordFormValues = {
  confirmarSenha: string;
  novaSenha: string;
  senhaAtual: string;
};

const initialValues: ChangePasswordFormValues = {
  confirmarSenha: "",
  novaSenha: "",
  senhaAtual: "",
};

type ChangePasswordModalProps = {
  onClose: () => void;
  onPasswordChanged: () => void;
  visible: boolean;
};

export function ChangePasswordModal({ onClose, onPasswordChanged, visible }: ChangePasswordModalProps) {
  const [values, setValues] = useState<ChangePasswordFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<ChangePasswordFormValues>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setValues(initialValues);
      setErrors({});
      setMessage(null);
    }
  }, [visible]);

  function updateField(field: keyof ChangePasswordFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setMessage(null);
  }

  function validate() {
    const passwordErrors = validateResetPassword({
      confirmarSenha: values.confirmarSenha,
      novaSenha: values.novaSenha,
    }) as FieldErrors<ChangePasswordFormValues>;

    if (!values.senhaAtual) {
      passwordErrors.senhaAtual = "Campo obrigatorio.";
    }

    return passwordErrors;
  }

  async function handleSubmit() {
    const nextErrors = validate();
    setErrors(nextErrors);
    setMessage(null);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error("Sessao expirada. Entre novamente.");
      }

      await changePassword({ novaSenha: values.novaSenha, senhaAtual: values.senhaAtual }, token);
      onPasswordChanged();
      onClose();
    } catch (submitError) {
      setMessage(getSubmitErrorMessage(submitError, "Nao foi possivel alterar a senha."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsModal onClose={onClose} testID="settings-change-password-modal" title="Alterar senha" visible={visible}>
      <FormMessage message={message} />

      <PasswordField
        error={errors.senhaAtual}
        label="Senha atual"
        onChangeText={(value) => updateField("senhaAtual", value)}
        placeholder="Digite sua senha atual"
        testID="settings-current-password"
        value={values.senhaAtual}
      />

      <PasswordField
        error={errors.novaSenha}
        label="Nova senha"
        onChangeText={(value) => updateField("novaSenha", value)}
        placeholder="Digite a nova senha"
        testID="settings-new-password"
        value={values.novaSenha}
      />

      <PasswordChecklist password={values.novaSenha} />

      <PasswordField
        error={errors.confirmarSenha}
        label="Confirmar nova senha"
        onChangeText={(value) => updateField("confirmarSenha", value)}
        placeholder="Repita a nova senha"
        testID="settings-confirm-password"
        value={values.confirmarSenha}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <AuthButton onPress={onClose} testID="settings-change-password-cancel" title="Cancelar" variant="secondary" />
        </View>
        <View className="flex-1">
          <AuthButton
            loading={loading}
            onPress={handleSubmit}
            testID="settings-change-password-save"
            title="Salvar"
          />
        </View>
      </View>
    </SettingsModal>
  );
}
