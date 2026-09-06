import { Mail, ShieldCheck } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import {
  AuthButton,
  AuthCard,
  AuthHeader,
  AuthLink,
  AuthShell,
  AuthTextField,
  PasswordField,
} from "@/features/auth/components";
import {
  hasFieldErrors,
  type FieldErrors,
  type LoginFormValues,
  validateLogin,
} from "@/features/auth/validation";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveAuthSession } from "@/lib/auth/session";
import { nativePropColors } from "@/lib/design/native-prop-colors";

const initialValues: LoginFormValues = {
  identificador: "",
  senha: "",
};

export function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ passwordChanged?: string; temporaryPasswordChanged?: string }>();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<LoginFormValues>>({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(() => {
    if (params.temporaryPasswordChanged) {
      return "Senha definitiva criada. Entre com sua nova senha.";
    }

    if (params.passwordChanged) {
      return "Senha alterada com sucesso. Entre com sua nova senha.";
    }

    return null;
  });

  const disabledOAuthText = useMemo(() => "Google Sign-In pendente de contrato OAuth.", []);

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit() {
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setMessage(null);
    setSuccess(null);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    setLoading(true);

    try {
      const session = await login({
        identificador: values.identificador.trim(),
        senha: values.senha,
      });

      await saveAuthSession(session, remember);
      router.replace("/inicio");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        router.push({
          pathname: "/trocar-senha-temporaria",
          params: { identificador: values.identificador.trim() },
        });
        return;
      }

      setMessage(getSubmitErrorMessage(error, "Nao foi possivel entrar agora."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell testID="login-screen">
      <AuthHeader subtitle="Acesse seu cuidado com seguranca." title="Entre na sua conta" />

      <AuthCard>
        <FormMessage message={success} tone="success" />
        <FormMessage message={message} />

        <AuthTextField
          autoComplete="email"
          error={errors.identificador}
          icon={Mail}
          keyboardType="email-address"
          label="E-mail ou login"
          onChangeText={(value) => updateField("identificador", value)}
          placeholder="seu@email.com"
          testID="login-identificador"
          value={values.identificador}
        />

        <PasswordField
          error={errors.senha}
          label="Senha"
          onChangeText={(value) => updateField("senha", value)}
          placeholder="Digite sua senha"
          testID="login-senha"
          value={values.senha}
        />

        <View className="flex-row items-center justify-between gap-4">
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: remember }}
            className="min-h-11 flex-1 flex-row items-center gap-2"
            onPress={() => setRemember((current) => !current)}
            testID="login-remember"
          >
            <Switch
              onValueChange={setRemember}
              thumbColor={nativePropColors.white}
              trackColor={{ false: "#d7d3c8", true: nativePropColors.brandMint }}
              value={remember}
            />
            <Text className="font-sans-medium text-[13px] text-auth-muted">Lembrar de mim</Text>
          </Pressable>

          <AuthLink href="/esqueci-senha" label="Esqueci a senha" />
        </View>

        <AuthButton loading={loading} onPress={handleSubmit} testID="login-submit" title="Entrar" />

        <AuthButton
          disabled
          icon={<ShieldCheck color={nativePropColors.authMuted} size={18} strokeWidth={2} />}
          title={disabledOAuthText}
          variant="secondary"
        />

        <View className="items-center">
          <Text className="font-sans text-[13px] text-auth-muted">Ainda nao tem conta?</Text>
          <AuthLink href="/cadastro" label="Criar cadastro" testID="login-register-link" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
