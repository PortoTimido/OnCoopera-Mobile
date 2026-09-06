import { User } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { AuthButton, AuthTextField } from "@/features/auth/components";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { SettingsModal } from "@/features/settings/components/SettingsModal";
import { updatePatientProfile } from "@/lib/api/auth";
import { getAccessToken, updateMemorySessionUser } from "@/lib/auth/session";

type EditNameModalProps = {
  name: string;
  onClose: () => void;
  onNameUpdated: (name: string) => void;
  visible: boolean;
};

export function EditNameModal({ name, onClose, onNameUpdated, visible }: EditNameModalProps) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue(name);
      setError(null);
      setMessage(null);
    }
  }, [name, visible]);

  async function handleSubmit() {
    const nextName = value.trim();

    if (!nextName) {
      setError("Informe seu nome completo.");
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error("Sessao expirada. Entre novamente.");
      }

      const { usuario } = await updatePatientProfile({ nome: nextName }, token);

      updateMemorySessionUser({ nome: usuario.nome });
      onNameUpdated(usuario.nome);
      onClose();
    } catch (submitError) {
      setMessage(getSubmitErrorMessage(submitError, "Nao foi possivel atualizar o nome."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsModal onClose={onClose} testID="settings-edit-name-modal" title="Editar nome" visible={visible}>
      <FormMessage message={message} />

      <AuthTextField
        error={error ?? undefined}
        icon={User}
        label="Nome completo"
        onChangeText={(text) => {
          setValue(text);
          setError(null);
        }}
        placeholder="Digite seu nome completo"
        testID="settings-edit-name-input"
        value={value}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <AuthButton onPress={onClose} testID="settings-edit-name-cancel" title="Cancelar" variant="secondary" />
        </View>
        <View className="flex-1">
          <AuthButton
            loading={loading}
            onPress={handleSubmit}
            testID="settings-edit-name-save"
            title="Salvar"
          />
        </View>
      </View>
    </SettingsModal>
  );
}
