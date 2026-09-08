import { CheckCircle2 } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText, FormMessage } from "@/components/ui";
import { AuthButton } from "@/features/auth/components";
import { HomeBottomNav } from "@/features/home/components";
import { useHomeClock } from "@/features/home/hooks/use-home-clock";
import { useHomeUser } from "@/features/home/hooks/use-home-user";
import { buildNotaVozSource } from "@/lib/api/diario-sintomas";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import {
  DiarioHistoryList,
  DiarioIntensitySlider,
  DiarioMoodSelector,
  DiarioSymptomGrid,
  DiarioTopBar,
  DiarioVoiceNoteCard,
} from "../components";
import { useDiarioSintomas } from "../hooks/use-diario-sintomas";
import { useVoiceRecorder } from "../hooks/use-voice-recorder";

export function DiarioSintomasScreen() {
  const { dateTimeLabel } = useHomeClock();
  const { initials } = useHomeUser();
  const diario = useDiarioSintomas();
  const recorder = useVoiceRecorder();
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!saveSuccess) return undefined;
    const timeout = setTimeout(() => setSaveSuccess(false), 3000);
    return () => clearTimeout(timeout);
  }, [saveSuccess]);

  const handleSave = useCallback(async () => {
    setSaveSuccess(false);

    const notaVoz = recorder.recordedUri
      ? { name: "nota-voz.m4a", type: "audio/m4a", uri: recorder.recordedUri }
      : undefined;

    const success = await diario.save(notaVoz);

    if (success) {
      recorder.reset();
      setSaveSuccess(true);
    }
  }, [diario, recorder]);

  const existingSource =
    diario.existingNotaVozUrl && diario.registroHojeId && diario.accessToken
      ? buildNotaVozSource(diario.registroHojeId, diario.accessToken)
      : null;

  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="diario-sintomas-screen">
        <DiarioTopBar dateTimeLabel={dateTimeLabel} initials={initials} />

        {diario.isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={nativePropColors.brandPrimary} />
          </View>
        ) : diario.loadError ? (
          <View className="flex-1 items-center justify-center gap-4 px-6">
            <AppText className="text-center text-feedback-danger" variant="body">
              {diario.loadError}
            </AppText>
            <Pressable
              accessibilityLabel="Tentar carregar o diário novamente"
              accessibilityRole="button"
              className="min-h-11 justify-center rounded-pill bg-brand-primary px-6"
              onPress={diario.retry}
            >
              <Text className="font-sans-bold text-[14px] text-white">Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView className="flex-1" contentContainerClassName="mx-auto w-full max-w-home gap-5 px-6 pb-32 pt-6" showsVerticalScrollIndicator={false}>
            <DiarioMoodSelector onSelect={diario.setHumor} value={diario.humor} />

            <View className="gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay">
              <AppText className="text-[17px] leading-[22px] text-home-ink" variant="subtitle">
                O que você sentiu hoje?
              </AppText>
              <DiarioSymptomGrid onToggle={diario.toggleSintoma} selected={diario.sintomas} />
            </View>

            {diario.activeSintoma && diario.sintomas[diario.activeSintoma] ? (
              <DiarioIntensitySlider
                descricaoOutro={diario.sintomas[diario.activeSintoma]?.descricaoOutro}
                intensidade={diario.sintomas[diario.activeSintoma]?.intensidade ?? 0}
                onChangeDescricaoOutro={diario.setDescricaoOutro}
                onChangeIntensidade={(value) => diario.setIntensidade(diario.activeSintoma!, value)}
                tipo={diario.activeSintoma}
              />
            ) : null}

            <DiarioVoiceNoteCard
              durationMillis={recorder.durationMillis}
              error={recorder.error}
              existingSource={existingSource}
              onCancel={recorder.cancel}
              onFinish={recorder.finish}
              onPause={recorder.pause}
              onRemoveExisting={diario.removeExistingNotaVoz}
              onResume={recorder.resume}
              onStart={recorder.start}
              permissionDenied={recorder.permissionDenied}
              recordedUri={recorder.recordedUri}
              status={recorder.status}
            />

            <FormMessage message={diario.saveError} tone="error" />
            <FormMessage message={saveSuccess ? "Registro do dia salvo com sucesso." : null} tone="success" />

            <AuthButton
              disabled={!diario.canSave}
              icon={<CheckCircle2 color={nativePropColors.white} size={18} strokeWidth={2.4} />}
              loading={diario.isSaving}
              onPress={handleSave}
              testID="diario-save-button"
              title="Salvar registro do dia"
            />

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <AppText className="text-[19px] leading-[24px] text-home-ink" variant="subtitle">
                  Registros anteriores
                </AppText>
              </View>

              <DiarioHistoryList registros={diario.history} />

              {diario.hasMoreHistory ? (
                <Pressable
                  accessibilityLabel="Carregar mais registros"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: diario.isLoadingMoreHistory }}
                  className="min-h-12 items-center justify-center rounded-pill border-2 border-brand-primary px-6"
                  disabled={diario.isLoadingMoreHistory}
                  onPress={diario.loadMoreHistory}
                >
                  {diario.isLoadingMoreHistory ? (
                    <ActivityIndicator color={nativePropColors.brandPrimary} />
                  ) : (
                    <Text className="font-sans-bold text-[14px] text-brand-primary">Ver mais registros</Text>
                  )}
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        )}

        <HomeBottomNav activeId="diario" />
      </View>
    </SafeAreaView>
  );
}
