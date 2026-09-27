import { Mail, Phone, UserRound } from "lucide-react-native";
import { View } from "react-native-css/components";

import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthLink } from "@/features/auth/components/AuthLink";
import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { BirthDatePicker } from "@/features/auth/components/BirthDatePicker";
import { PasswordChecklist } from "@/features/auth/components/PasswordChecklist";
import { PasswordField } from "@/features/auth/components/PasswordField";
import type { useRegister } from "@/features/auth/hooks/use-register";
import { formatPhoneBR } from "@/features/auth/masks";
import { validateEmailRequest } from "@/features/auth/validation";

type RegisterStepOneFormProps = Pick<
  ReturnType<typeof useRegister>,
  "errors" | "goToNextStep" | "setFieldError" | "updateField" | "values"
>;

export function RegisterStepOneForm({ errors, goToNextStep, setFieldError, updateField, values }: RegisterStepOneFormProps) {
  return (
    <View className="gap-4">
      <AuthTextField
        autoCapitalize="words"
        error={errors.nome}
        icon={UserRound}
        label="Nome completo"
        onChangeText={(value) => updateField("nome", value)}
        placeholder="Seu nome"
        value={values.nome}
      />

      <AuthTextField
        error={errors.email}
        icon={Mail}
        keyboardType="email-address"
        label="E-mail"
        onBlur={() => setFieldError("email", validateEmailRequest(values.email))}
        onChangeText={(value) => updateField("email", value)}
        placeholder="seu@email.com"
        value={values.email}
      />

      <View className="gap-4 sm:flex-row">
        <AuthTextField
          containerClassName="flex-1"
          error={errors.telefone}
          icon={Phone}
          keyboardType="phone-pad"
          label="Telefone"
          maxLength={16}
          onChangeText={(value) => updateField("telefone", value)}
          placeholder="(00) 00000-0000"
          value={formatPhoneBR(values.telefone)}
        />
        <View className="flex-1">
          <BirthDatePicker
            error={errors.dataNascimento}
            label="Nascimento"
            onChange={(isoDate) => updateField("dataNascimento", isoDate)}
            testID="cadastro-data-nascimento"
            value={values.dataNascimento}
          />
        </View>
      </View>

      <PasswordField
        error={errors.senha}
        label="Senha"
        onChangeText={(value) => updateField("senha", value)}
        placeholder="Crie uma senha"
        value={values.senha}
      />
      <PasswordChecklist password={values.senha} />
      <PasswordField
        error={errors.confirmarSenha}
        label="Confirmar senha"
        onChangeText={(value) => updateField("confirmarSenha", value)}
        placeholder="Repita sua senha"
        value={values.confirmarSenha}
      />

      <AuthButton onPress={goToNextStep} testID="cadastro-proximo" title="Proximo" />

      <View className="items-center">
        <AuthLink href="/login" label="Ja tenho uma conta" />
      </View>
    </View>
  );
}
