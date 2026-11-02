import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, FormMessage } from "@/components/ui";
import { AuthButton, AuthCard, AuthHeader } from "@/features/auth/components";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { LegalDocumentContent } from "@/features/documentos-legais/components/LegalDocumentContent";
import { acceptTermsOfUse } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getLegalDocument, type LegalDocument } from "@/lib/api/documentos-legais";
import { clearPendingTermsAcceptance, getPendingTermsAcceptance, saveAuthSession, type PendingTermsAcceptance } from "@/lib/auth/session";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function TermsAcceptanceScreen() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingTermsAcceptance | null>();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submissionInFlight = useRef(false);

  async function returnToLogin(message?: string) {
    await clearPendingTermsAcceptance();
    router.replace(message ? { pathname: "/login", params: { termsMessage: message } } : "/login");
  }

  async function load() {
    setLoading(true);
    setError(null);
    const currentPending = await getPendingTermsAcceptance();
    if (!currentPending) {
      router.replace("/login");
      return;
    }

    try {
      setPending(currentPending);
      setDocument(await getLegalDocument("TERMOS_USO"));
    } catch (cause) {
      setError(getSubmitErrorMessage(cause, "Não foi possível carregar os Termos de Uso."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function accept() {
    if (!pending || !reachedEnd || submissionInFlight.current) return;
    submissionInFlight.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const response = await acceptTermsOfUse(pending.tokenAceite);
      await saveAuthSession({ accessToken: response.accessToken, usuario: pending.usuario }, pending.remember);
      await clearPendingTermsAcceptance();
      router.replace({ pathname: "/inicio", params: { medicalGuidance: "1" } });
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
        await returnToLogin("Seu acesso para aceite expirou. Entre novamente.");
        return;
      }
      setError(getSubmitErrorMessage(cause, "Não foi possível registrar seu aceite. Tente novamente."));
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.authCanvas, flex: 1 }}>
      <View className="flex-1 bg-auth-canvas" testID="terms-acceptance-screen">
        <View className="mx-auto w-full max-w-auth gap-5 px-5 pb-5 pt-6">
          <AuthHeader subtitle="Leia os termos até o fim para continuar." title="Termos de Uso" />
          <AuthCard className="gap-4">
            <FormMessage message={error} />
            {loading ? <View className="h-48 items-center justify-center"><ActivityIndicator color={nativePropColors.brandPrimary} /></View> : document ? (
              <ScrollView
                className="max-h-[360px] rounded-2xl bg-auth-canvas px-4 py-4"
                contentContainerClassName="pb-2"
                onMomentumScrollEnd={({ nativeEvent }) => setReachedEnd(nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 2)}
                onContentSizeChange={(_width, height) => {
                  if (height <= 360) setReachedEnd(true);
                }}
                onScroll={({ nativeEvent }) => setReachedEnd((current) => current || nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 2)}
                scrollEventThrottle={16}
                testID="terms-acceptance-scroll"
              >
                <LegalDocumentContent html={document.conteudo} />
              </ScrollView>
            ) : null}
            {!loading && !document ? <AuthButton onPress={() => void load()} title="Tentar novamente" variant="secondary" /> : null}
            <AuthButton disabled={!reachedEnd || loading || !document} loading={submitting} onPress={() => void accept()} testID="terms-acceptance-submit" title="Aceitar e continuar" />
            <Pressable accessibilityRole="button" className="min-h-11 items-center justify-center" onPress={() => void returnToLogin()} testID="terms-acceptance-decline">
              <AppText className="text-auth-muted">Não aceito</AppText>
            </Pressable>
          </AuthCard>
        </View>
      </View>
    </SafeAreaView>
  );
}
