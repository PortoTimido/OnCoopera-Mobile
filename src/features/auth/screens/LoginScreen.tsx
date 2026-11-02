import { Mail } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
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
import { login, loginWithGoogle } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { saveAuthSession } from "@/lib/auth/session";
import {
  getGoogleIdToken,
  GoogleSignInError,
  isGoogleSignInAvailable,
} from "@/lib/auth/google-sign-in";
import { nativePropColors } from "@/lib/design/native-prop-colors";

const initialValues: LoginFormValues = {
  identificador: "",
  senha: "",
};

function getGoogleErrorMessage(error: unknown) {
  if (error instanceof GoogleSignInError) {
    if (error.reason === "configuration") {
      return "O login com Google não está configurado neste ambiente.";
    }

    if (error.reason === "play-services-unavailable") {
      return "Atualize o Google Play Services para continuar com o Google.";
    }

    if (error.reason === "missing-id-token") {
      return "Não foi possível validar sua conta Google. Tente novamente.";
    }

    return "Não foi possível entrar com o Google agora.";
  }

  if (error instanceof ApiError) {
    if (error.status === 0) {
      return error.message;
    }

    if (
      error.status === 409 &&
      error.body?.error === "GOOGLE_ACCOUNT_NOT_REGISTERED"
    ) {
      return "Nenhum cadastro foi encontrado para esta conta Google. Crie seu cadastro antes de continuar.";
    }

    if (error.status === 401) {
      return "Não foi possível validar sua conta Google. Tente novamente.";
    }
  }

  return "Não foi possível entrar com o Google agora.";
}

export function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ passwordChanged?: string; temporaryPasswordChanged?: string }>();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<LoginFormValues>>({});
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const actionInFlight = useRef<"google" | "password" | null>(null);
  const [success, setSuccess] = useState<string | null>(() => {
    if (params.temporaryPasswordChanged) {
      return "Senha definitiva criada. Entre com sua nova senha.";
    }

    if (params.passwordChanged) {
      return "Senha alterada com sucesso. Entre com sua nova senha.";
    }

    return null;
  });

  const googleAvailable = isGoogleSignInAvailable();

  function updateField(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit() {
    if (actionInFlight.current) {
      return;
    }

    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setMessage(null);
    setSuccess(null);

    if (hasFieldErrors(nextErrors)) {
      return;
    }

    actionInFlight.current = "password";
    setLoading(true);

    try {
      const session = await login({
        identificador: values.identificador.trim(),
        senha: values.senha,
      });

      await saveAuthSession(session, remember);
      router.replace({ pathname: "/inicio", params: { medicalGuidance: "1" } });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        router.push({
          pathname: "/trocar-senha-temporaria",
          params: { identificador: values.identificador.trim() },
        });
        return;
      }

      setMessage(getSubmitErrorMessage(error, "Não foi possível entrar agora."));
    } finally {
      actionInFlight.current = null;
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (actionInFlight.current || !googleAvailable) {
      return;
    }

    actionInFlight.current = "google";
    setGoogleLoading(true);
    setMessage(null);
    setSuccess(null);

    try {
      const googleResult = await getGoogleIdToken();

      if (googleResult.type === "cancelled") {
        return;
      }

      const session = await loginWithGoogle({ idToken: googleResult.idToken });
      await saveAuthSession(session, remember);
      router.replace({ pathname: "/inicio", params: { medicalGuidance: "1" } });
    } catch (error) {
      setMessage(getGoogleErrorMessage(error));
    } finally {
      actionInFlight.current = null;
      setGoogleLoading(false);
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

        <AuthButton
          disabled={googleLoading}
          loading={loading}
          onPress={handleSubmit}
          testID="login-submit"
          title="Entrar"
        />

        <AuthButton
          disabled={loading || !googleAvailable}
          loading={googleLoading}
          onPress={() => void handleGoogleSignIn()}
          testID="login-google"
          title="Continuar com Google"
          variant="secondary"
        />

        <View className="items-center">
          <Text className="font-sans text-[13px] text-auth-muted">Ainda não tem conta?</Text>
          <AuthLink href="/cadastro" label="Criar cadastro" testID="login-register-link" />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
