import { LockKeyhole } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { AuthButton, AuthCard, AuthHeader, AuthShell, AuthTextField } from "@/features/auth/components";
import { usePasswordRecovery } from "@/features/auth/password-recovery-context";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { validatePasswordRecoveryCode } from "@/features/auth/validation";
import { requestPatientPasswordRecovery, verifyPatientPasswordRecoveryCode } from "@/lib/api/auth";

type RecoveryFeedback = {
  message: string;
  tone: "error" | "success";
};

export function VerifyPasswordRecoveryCodeScreen() {
  const router = useRouter();
  const { clearRecovery, email, startRecovery, storeResetToken } = usePasswordRecovery();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [feedback, setFeedback] = useState<RecoveryFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!email) {
      router.replace("/esqueci-senha");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  const recoveryEmail = email;

  async function handleSubmit() {
    const nextError = validatePasswordRecoveryCode(code);
    setError(nextError);
    setFeedback(null);

    if (nextError) {
      return;
    }

    setLoading(true);

    try {
      const { resetToken } = await verifyPatientPasswordRecoveryCode({ code, email: recoveryEmail });
      storeResetToken(resetToken);
      router.push("/redefinir-senha");
    } catch (submitError) {
      setFeedback({
        message: getSubmitErrorMessage(submitError, "Nao foi possivel validar o código agora."),
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setFeedback(null);
    setResending(true);

    try {
      await requestPatientPasswordRecovery({ email: recoveryEmail });
      startRecovery(recoveryEmail);
      setFeedback({
        message: "Se o e-mail estiver cadastrado, um novo código foi enviado.",
        tone: "success",
      });
    } catch (submitError) {
      setFeedback({
        message: getSubmitErrorMessage(submitError, "Nao foi possivel reenviar o código agora."),
        tone: "error",
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell testID="verificar-codigo-recuperacao-screen">
      <AuthHeader subtitle={`Digite o código de 6 dígitos enviado para ${recoveryEmail}.`} title="Verificar código" />

      <AuthCard>
        <FormMessage message={feedback?.message} tone={feedback?.tone} />

        <AuthTextField
          autoComplete="one-time-code"
          error={error}
          icon={LockKeyhole}
          keyboardType="number-pad"
          label="Código de verificação"
          maxLength={6}
          onChangeText={(value) => {
            setCode(value.replace(/\D/g, ""));
            setError(undefined);
          }}
          placeholder="000000"
          testID="recovery-code"
          value={code}
        />

        <AuthButton
          disabled={code.length !== 6}
          loading={loading}
          onPress={handleSubmit}
          testID="recovery-code-submit"
          title="Verificar código"
        />

        <View className="items-center gap-1">
          <AuthButton
            loading={resending}
            onPress={handleResend}
            testID="recovery-code-resend"
            title="Reenviar código"
            variant="ghost"
          />
          <AuthButton
            onPress={() => {
              clearRecovery();
              router.replace("/esqueci-senha");
            }}
            title="Voltar"
            variant="ghost"
          />
        </View>
      </AuthCard>
    </AuthShell>
  );
}
