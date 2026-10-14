import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useRouter } from "expo-router";
import { ArrowLeft, Check, FileText } from "lucide-react-native";
import { useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native-css/components";

import { AppText, FormMessage } from "@/components/ui";
import { HomeBottomNav } from "@/features/home/components";
import { SINTOMA_LABEL } from "@/features/diario-sintomas/diario-sintomas-formatters";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { buildMedicalReportHtml, REPORT_PERIODS, type ReportPeriodDays } from "../report-formatters";
import { useMedicalReport } from "../hooks/use-medical-report";

const BAR_COLORS = ["bg-brand-primary", "bg-report-coral", "bg-home-purple"];
const TEXT_COLORS = ["text-brand-primary", "text-report-coral-ink", "text-home-lavender-ink"];

function printReportOnWeb(html: string) {
  return new Promise<void>((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.left = "-10000px";
    frame.style.top = "0";
    frame.style.width = "794px";
    frame.style.height = "1123px";
    frame.style.border = "0";

    const cleanup = () => frame.remove();
    frame.onload = () => {
      try {
        const printWindow = frame.contentWindow;
        if (!printWindow) throw new Error("Janela de impressão indisponível.");
        printWindow.addEventListener("afterprint", cleanup, { once: true });
        printWindow.focus();
        printWindow.print();
        // Some browsers do not fire afterprint when the dialog is dismissed.
        setTimeout(cleanup, 60_000);
        resolve();
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    frame.onerror = () => {
      cleanup();
      reject(new Error("Não foi possível carregar o relatório para impressão."));
    };
    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

export function MedicalReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [days, setDays] = useState<ReportPeriodDays>(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const report = useMedicalReport(days);
  const topMetrics = report.metrics.slice(0, 3);

  async function generatePdf() {
    if (!report.patientName || report.periodRecords.length === 0) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    let stage = "montagem do HTML";
    try {
      const html = buildMedicalReportHtml({ days, patientName: report.patientName, records: report.periodRecords });
      if (Platform.OS === "web") {
        stage = "impressão no navegador";
        await printReportOnWeb(html);
        return;
      }

      stage = "geração do arquivo PDF";
      const { uri } = await Print.printToFileAsync({ html });
      if (!uri) throw new Error("A geração do PDF não retornou um arquivo.");

      stage = "verificação do compartilhamento";
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (!isSharingAvailable) {
        throw new Error("Compartilhamento indisponível neste dispositivo.");
      }

      stage = "compartilhamento do PDF";
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf" });
    } catch (error) {
      console.error(`[Relatório Médico] Falha na ${stage} (${Platform.OS}).`, error);
      setGenerationError("Não foi possível gerar ou compartilhar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = Boolean(report.patientName && report.periodRecords.length > 0 && !report.isLoading && !report.error);

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="flex-1 bg-home-canvas" testID="medical-report-screen">
        <View
          className="flex-row items-center gap-3 border-b border-home-border bg-home-surface px-5"
          style={{ height: 66 + insets.top, paddingTop: insets.top }}
        >
          <Pressable accessibilityLabel="Voltar" accessibilityRole="button" className="size-7 items-center justify-center" hitSlop={8} onPress={() => router.back()} testID="medical-report-back">
            <ArrowLeft color={nativePropColors.brandPrimary} size={22} strokeWidth={2.5} />
          </Pressable>
          <AppText className="text-[25px] leading-[30px] text-brand-primary" variant="title">Relatório Médico</AppText>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="mx-auto w-full max-w-home gap-7 px-6 pb-32 pt-8" showsVerticalScrollIndicator={false}>
          <View className="min-h-[172px] overflow-hidden rounded-home-card bg-brand-mint px-8 py-8 shadow-home-clay">
            <View className="max-w-[240px] gap-2">
              <AppText className="text-[28px] leading-[34px] text-brand-primary" variant="title">Relatório para o médico</AppText>
              <Text className="font-sans text-[14px] leading-[20px] text-brand-primary/80">Resumo clínico detalhado para facilitar sua próxima consulta.</Text>
            </View>
            <View className="absolute bottom-0 right-0 h-20 w-20 rounded-tl-2xl bg-brand-primary/15" />
          </View>

          <View className="gap-4">
            <AppText className="text-[19px] leading-[25px] text-brand-primary" variant="subtitle">Período do Relatório</AppText>
            {REPORT_PERIODS.map((period) => {
              const selected = period.days === days;
              return (
                <Pressable
                  accessibilityLabel={period.label}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  className={`min-h-16 flex-row items-center justify-between rounded-pill border-2 px-5 ${selected ? "border-brand-mint bg-home-surface shadow-home-clay" : "border-home-border bg-home-surface"}`}
                  key={period.days}
                  onPress={() => setDays(period.days)}
                  testID={`medical-report-period-${period.days}`}
                >
                  <Text className={`font-sans-semibold text-[16px] leading-[22px] ${selected ? "text-home-ink" : "text-home-muted"}`}>{period.label}</Text>
                  <View className={`size-6 items-center justify-center rounded-pill border-2 ${selected ? "border-brand-primary bg-brand-primary" : "border-brand-primary/25"}`}>
                    {selected ? <Check color={nativePropColors.white} size={14} strokeWidth={3} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {report.isLoading ? <View className="items-center py-10"><ActivityIndicator color={nativePropColors.brandPrimary} /></View> : null}
          <FormMessage message={report.error} />

          {!report.isLoading && !report.error && report.periodRecords.length === 0 ? (
            <FormMessage message="Não há registros no período selecionado para gerar o relatório." tone="info" />
          ) : null}

          {!report.isLoading && !report.error && topMetrics.length > 0 ? (
            <View className="gap-6 rounded-home-card bg-home-surface p-6 shadow-home-clay" testID="medical-report-symptoms">
              <AppText className="text-[19px] leading-[25px] text-brand-primary" variant="subtitle">Frequência de sintomas</AppText>
              {topMetrics.map((metric, index) => (
                <View className="gap-2" key={metric.tipo}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-sans-bold text-[14px] text-home-ink">{SINTOMA_LABEL[metric.tipo]}</Text>
                    <Text className={`font-sans-bold text-[14px] ${TEXT_COLORS[index]}`}>{metric.percentage}% dos dias</Text>
                  </View>
                  <View className="h-4 overflow-hidden rounded-pill bg-home-border">
                    <View className={`h-full rounded-pill ${BAR_COLORS[index]}`} style={{ width: `${Math.max(metric.percentage, 3)}%` }} />
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          <FormMessage message={generationError} />
          <Pressable
            accessibilityLabel="Gerar PDF Completo"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canGenerate || isGenerating }}
            className="min-h-16 flex-row items-center justify-center gap-3 rounded-pill bg-brand-primary px-6 shadow-home-clay disabled:opacity-50"
            disabled={!canGenerate || isGenerating}
            onPress={generatePdf}
            testID="medical-report-generate"
          >
            {isGenerating ? <ActivityIndicator color={nativePropColors.white} /> : <FileText color={nativePropColors.white} size={21} strokeWidth={2.2} />}
            <Text className="font-sans-bold text-[16px] text-white">{isGenerating ? "Gerando PDF..." : "Gerar PDF Completo"}</Text>
          </Pressable>
        </ScrollView>

        <HomeBottomNav />
      </View>
    </SafeAreaView>
  );
}
