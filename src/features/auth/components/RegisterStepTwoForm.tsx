import { Home, MapPin } from "lucide-react-native";
import { View } from "react-native-css/components";

import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthLink } from "@/features/auth/components/AuthLink";
import { AuthTextField } from "@/features/auth/components/AuthTextField";
import type { useRegister } from "@/features/auth/hooks/use-register";
import { formatCepBR } from "@/features/auth/masks";

type RegisterStepTwoFormProps = Pick<
  ReturnType<typeof useRegister>,
  | "cepLookupLoading"
  | "cepLookupMessage"
  | "errors"
  | "goToPreviousStep"
  | "handleSubmit"
  | "loading"
  | "updateField"
  | "values"
>;

export function RegisterStepTwoForm({
  cepLookupLoading,
  cepLookupMessage,
  errors,
  goToPreviousStep,
  handleSubmit,
  loading,
  updateField,
  values,
}: RegisterStepTwoFormProps) {
  return (
    <View className="gap-4">
      <AuthTextField
        error={errors.cep}
        helperText={
          cepLookupLoading ? "Buscando endereco pelo ViaCEP..." : (cepLookupMessage ?? "Digite 8 digitos para preencher o endereco.")
        }
        icon={MapPin}
        keyboardType="number-pad"
        label="CEP"
        maxLength={9}
        onChangeText={(value) => updateField("cep", value)}
        placeholder="00000-000"
        value={formatCepBR(values.cep)}
      />

      <AuthTextField
        error={errors.estado}
        label="UF"
        maxLength={2}
        onChangeText={(value) => updateField("estado", value)}
        placeholder="SP"
        value={values.estado}
      />

      <AuthTextField
        autoCapitalize="words"
        error={errors.cidade}
        label="Cidade"
        onChangeText={(value) => updateField("cidade", value)}
        placeholder="Sua cidade"
        value={values.cidade}
      />

      <AuthTextField
        autoCapitalize="words"
        error={errors.bairro}
        label="Bairro"
        onChangeText={(value) => updateField("bairro", value)}
        placeholder="Seu bairro"
        value={values.bairro}
      />

      <AuthTextField
        autoCapitalize="words"
        error={errors.logradouro}
        icon={Home}
        label="Endereco"
        onChangeText={(value) => updateField("logradouro", value)}
        placeholder="Rua, avenida..."
        value={values.logradouro}
      />

      <View className="gap-4 sm:flex-row">
        <AuthTextField
          containerClassName="flex-1"
          error={errors.numero}
          keyboardType="number-pad"
          label="Numero"
          onChangeText={(value) => updateField("numero", value)}
          placeholder="123"
          value={values.numero}
        />
        <AuthTextField
          containerClassName="flex-1"
          label="Complemento"
          onChangeText={(value) => updateField("complemento", value)}
          placeholder="Apto, bloco"
          value={values.complemento}
        />
      </View>

      <AuthButton loading={loading} onPress={handleSubmit} testID="cadastro-submit" title="Criar conta" />
      <AuthButton onPress={goToPreviousStep} title="Voltar" variant="secondary" />

      <View className="items-center">
        <AuthLink href="/login" label="Ja tenho uma conta" />
      </View>
    </View>
  );
}
