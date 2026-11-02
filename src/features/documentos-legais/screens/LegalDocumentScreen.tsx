import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { LegalDocumentContent } from "@/features/documentos-legais/components/LegalDocumentContent";
import { getLegalDocument, type LegalDocument, type LegalDocumentType } from "@/lib/api/documentos-legais";
import { getSubmitErrorMessage } from "@/features/auth/screens/screen-helpers";
import { nativePropColors } from "@/lib/design/native-prop-colors";

const labels: Record<LegalDocumentType, string> = {
  POLITICA_PRIVACIDADE: "Política de Privacidade",
  TERMOS_USO: "Termos de Uso",
};

type LegalDocumentScreenProps = { type: LegalDocumentType };

export function LegalDocumentScreen({ type }: LegalDocumentScreenProps) {
  const router = useRouter();
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setDocument(await getLegalDocument(type));
    } catch (cause) {
      setError(getSubmitErrorMessage(cause, "Não foi possível carregar o documento."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [type]);

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="flex-1 bg-home-canvas" testID="legal-document-screen">
        <View className="h-14 flex-row items-center gap-3 border-b border-home-border bg-home-surface px-4">
          <Pressable accessibilityLabel="Voltar" accessibilityRole="button" className="size-8 items-center justify-center" hitSlop={8} onPress={() => router.back()}>
            <ArrowLeft color={nativePropColors.brandPrimary} size={22} strokeWidth={2.4} />
          </Pressable>
          <AppText className="text-[18px] leading-[24px] text-brand-primary" variant="subtitle">OnCoopera</AppText>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center"><ActivityIndicator color={nativePropColors.brandPrimary} /></View>
        ) : error || !document ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            <AppText className="text-center text-feedback-danger">{error ?? "Documento não encontrado."}</AppText>
            <Pressable accessibilityRole="button" className="rounded-pill bg-brand-primary px-6 py-3" onPress={() => void load()} testID="legal-document-retry">
              <AppText className="text-white" variant="subtitle">Tentar novamente</AppText>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerClassName="mx-auto w-full max-w-home gap-4 px-6 pb-12 pt-8" showsVerticalScrollIndicator={false}>
            <View className="gap-1">
              <AppText className="text-[30px] leading-[36px] text-home-ink" variant="title">{labels[type]}</AppText>
              <AppText className="text-home-muted">Versão {document.versao}</AppText>
            </View>
            <LegalDocumentContent html={document.conteudo} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
