import { Check, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import { ActivityIndicator, View } from "react-native-css/components";

import { AppText, FormMessage } from "@/components/ui";
import { LegalDocumentContent } from "@/features/documentos-legais/components/LegalDocumentContent";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { ApiError } from "@/lib/api/client";
import { getLegalDocument, type LegalDocument, type LegalDocumentType } from "@/lib/api/documentos-legais";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export type RegisterLegalAcceptanceState = {
  acceptedTerms: boolean;
  hasTerms: boolean;
  hasLoadError: boolean;
  loading: boolean;
};

type RegisterLegalAcceptanceProps = {
  onStateChange: (state: RegisterLegalAcceptanceState) => void;
};

const documentLabels: Record<LegalDocumentType, string> = {
  POLITICA_PRIVACIDADE: "Política de Privacidade",
  TERMOS_USO: "Termos de Uso",
};

function isNotFound(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export function RegisterLegalAcceptance({ onStateChange }: RegisterLegalAcceptanceProps) {
  const [documents, setDocuments] = useState<Partial<Record<LegalDocumentType, LegalDocument>>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<LegalDocumentType | null>(null);
  const [termsRead, setTermsRead] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  function retry() {
    setReloadKey((current) => current + 1);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setDocuments({});
      setTermsRead(false);
      setAcceptedTerms(false);

      const results = await Promise.allSettled([
        getLegalDocument("TERMOS_USO"),
        getLegalDocument("POLITICA_PRIVACIDADE"),
      ]);

      if (!active) return;

      const [termsResult, privacyResult] = results;
      const failures = [termsResult, privacyResult].filter(
        (result): result is PromiseRejectedResult => result.status === "rejected" && !isNotFound(result.reason),
      );

      if (failures.length > 0) {
        setError(getSubmitErrorMessage(failures[0].reason, "Não foi possível carregar os documentos legais."));
        setLoading(false);
        return;
      }

      setDocuments({
        ...(termsResult.status === "fulfilled" ? { TERMOS_USO: termsResult.value } : {}),
        ...(privacyResult.status === "fulfilled" ? { POLITICA_PRIVACIDADE: privacyResult.value } : {}),
      });
      setLoading(false);
    }

    void load();
    return () => { active = false; };
  }, [reloadKey]);

  const terms = documents.TERMOS_USO;
  const privacy = documents.POLITICA_PRIVACIDADE;
  useEffect(() => {
    onStateChange({ acceptedTerms, hasLoadError: Boolean(error), hasTerms: Boolean(terms), loading });
  }, [acceptedTerms, error, loading, onStateChange, terms]);

  const selectedDocument = selectedType ? documents[selectedType] : undefined;

  return (
    <View className="gap-3" testID="cadastro-aceite-documentos">
      {loading ? (
        <View className="min-h-12 flex-row items-center gap-3 px-1">
          <ActivityIndicator color={nativePropColors.brandPrimary} />
          <AppText>Carregando documentos legais...</AppText>
        </View>
      ) : error ? (
        <View className="gap-3">
          <FormMessage message={error} />
          <Pressable accessibilityRole="button" className="self-start" onPress={retry} testID="cadastro-documentos-tentar-novamente">
            <AppText className="text-brand-primary underline" variant="label">Tentar novamente</AppText>
          </Pressable>
        </View>
      ) : terms ? (
        <View className="flex-row items-start gap-3">
          <Pressable
            accessibilityLabel="Aceitar Termos de Uso"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms, disabled: !termsRead }}
            className="mt-1 size-9 items-center justify-center rounded-full border-2"
            disabled={!termsRead}
            onPress={() => setAcceptedTerms((current) => !current)}
            style={{
              backgroundColor: acceptedTerms ? nativePropColors.brandPrimary : "transparent",
              borderColor: acceptedTerms ? nativePropColors.brandPrimary : termsRead ? "#b8c7c2" : "#cfd8d5",
              opacity: termsRead ? 1 : 0.55,
            }}
            testID="cadastro-termos-checkbox"
          >
            {acceptedTerms ? <Check color={nativePropColors.white} size={20} strokeWidth={3} /> : null}
          </Pressable>
          <View className="flex-1 pt-0.5">
            <AppText className="text-[17px] leading-[27px] text-auth-muted">
              Eu li e aceito os{" "}
              <AppText className="text-[17px] leading-[27px] text-brand-primary underline" onPress={() => setSelectedType("TERMOS_USO")}>Termos de Uso</AppText>
              {privacy ? (
                <>
                  {" "}e a{" "}
                  <AppText className="text-[17px] leading-[27px] text-brand-primary underline" onPress={() => setSelectedType("POLITICA_PRIVACIDADE")}>Política de Privacidade</AppText>.
                </>
              ) : "."}
            </AppText>
            {!termsRead ? <AppText className="mt-1">Leia os Termos de Uso até o fim para habilitar o aceite.</AppText> : null}
          </View>
        </View>
      ) : privacy ? (
        <AppText className="text-[17px] leading-[27px] text-auth-muted">
          Leia a{" "}
          <AppText className="text-[17px] leading-[27px] text-brand-primary underline" onPress={() => setSelectedType("POLITICA_PRIVACIDADE")}>Política de Privacidade</AppText>.
        </AppText>
      ) : null}

      <Modal animationType="slide" onRequestClose={() => setSelectedType(null)} transparent visible={Boolean(selectedDocument)}>
        <View className="flex-1 justify-end bg-black/40 px-4 pb-6 pt-12">
          <View className="max-h-full gap-4 rounded-card-auth bg-auth-card px-6 py-6">
            <View className="flex-row items-center justify-between gap-4">
              <AppText className="flex-1 text-[24px] leading-[30px] text-auth-ink" variant="title">{selectedType ? documentLabels[selectedType] : ""}</AppText>
              <Pressable accessibilityLabel="Fechar documento" accessibilityRole="button" className="size-11 items-center justify-center" onPress={() => setSelectedType(null)}>
                <X color={nativePropColors.brandPrimary} size={24} />
              </Pressable>
            </View>
            {selectedDocument ? (
              <ScrollView
                className="max-h-[440px] rounded-2xl bg-auth-canvas px-4 py-4"
                contentContainerStyle={{ paddingBottom: 8 }}
                onContentSizeChange={(_width, height) => {
                  if (selectedType === "TERMOS_USO" && height <= 440) setTermsRead(true);
                }}
                onScroll={({ nativeEvent }) => {
                  if (selectedType === "TERMOS_USO" && nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 2) {
                    setTermsRead(true);
                  }
                }}
                scrollEventThrottle={16}
                testID="cadastro-documento-scroll"
              >
                <LegalDocumentContent html={selectedDocument.conteudo} />
              </ScrollView>
            ) : null}
            <Pressable accessibilityRole="button" className="min-h-12 items-center justify-center rounded-pill bg-brand-primary px-5" onPress={() => setSelectedType(null)}>
              <AppText className="text-white" variant="subtitle">Fechar</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
