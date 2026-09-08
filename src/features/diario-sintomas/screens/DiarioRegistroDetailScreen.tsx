import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Pause, Play } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { buildNotaVozSource, getRegistroDiarioById, type RegistroDiario } from "@/lib/api/diario-sintomas";
import { getAccessToken } from "@/lib/auth/session";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { formatDataRegistroFull, formatIntensidade, formatRecordingDuration, HUMOR_LABEL, SINTOMA_LABEL } from "../diario-sintomas-formatters";

export function DiarioRegistroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [registro, setRegistro] = useState<RegistroDiario | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return;

      try {
        const token = await getAccessToken();
        if (!token) throw new Error("Sessão expirada.");

        const result = await getRegistroDiarioById(id, token);

        if (mounted) {
          setAccessToken(token);
          setRegistro(result);
        }
      } catch {
        if (mounted) setError(true);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const notaVozSource = registro?.notaVozUrl && accessToken ? buildNotaVozSource(registro.id, accessToken) : null;
  const player = useAudioPlayer(notaVozSource);
  const playerStatus = useAudioPlayerStatus(player);

  if (!registro && !error) {
    return (
      <SafeAreaView style={{ backgroundColor: "#e5e5e5", flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={nativePropColors.brandPrimary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!registro) {
    return (
      <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <AppText className="text-center text-feedback-danger" variant="body">
            Não foi possível carregar este registro.
          </AppText>
          <Pressable
            accessibilityLabel="Voltar para o diário"
            accessibilityRole="button"
            className="min-h-11 justify-center rounded-pill bg-brand-primary px-6"
            onPress={() => router.back()}
          >
            <Text className="font-sans-bold text-[14px] text-white">Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: "#e5e5e5", flex: 1 }}>
      <View className="flex-1 justify-end" testID="diario-registro-detail-screen">
        <View className="max-h-[88%] rounded-t-radar-sheet bg-radar-sheet px-8 pb-8 pt-4 shadow-modal">
          <View className="mb-5 items-center">
            <View className="h-1.5 w-10 rounded-pill bg-radar-info-border" />
          </View>
          <Pressable
            accessibilityLabel="Voltar para o diário"
            accessibilityRole="button"
            className="absolute left-6 top-5 size-11 items-center justify-center rounded-pill bg-radar-info"
            hitSlop={8}
            onPress={() => router.back()}
          >
            <ArrowLeft color={nativePropColors.brandPrimary} size={21} strokeWidth={2.5} />
          </Pressable>

          <ScrollView contentContainerClassName="gap-6 pb-2" showsVerticalScrollIndicator={false}>
            <View className="items-center gap-2 pt-2">
              <AppText className="text-[24px] leading-[30px] text-brand-primary" variant="title">
                {formatDataRegistroFull(registro.dataRegistro)}
              </AppText>
              <View className="rounded-pill bg-brand-soft px-5 py-2">
                <Text className="font-sans-bold text-[12px] tracking-wide text-brand-primary">
                  {HUMOR_LABEL[registro.humor].toLocaleUpperCase("pt-BR")}
                </Text>
              </View>
            </View>

            <View className="gap-3">
              {registro.sintomas.map((sintoma) => (
                <View className="flex-row items-center justify-between rounded-2xl border-2 border-radar-info-border bg-radar-info px-5 py-4" key={sintoma.tipo}>
                  <View className="flex-1 gap-0.5">
                    <Text className="font-sans-bold text-[14px] text-home-ink">{SINTOMA_LABEL[sintoma.tipo]}</Text>
                    {sintoma.tipo === "OUTRO" && sintoma.descricaoOutro ? (
                      <Text className="font-sans text-[13px] text-home-muted">{sintoma.descricaoOutro}</Text>
                    ) : null}
                  </View>
                  <Text className="font-sans-bold text-[14px] text-brand-primary">{formatIntensidade(sintoma.intensidade)}</Text>
                </View>
              ))}
            </View>

            {notaVozSource ? (
              <Pressable
                accessibilityLabel={playerStatus.playing ? "Pausar nota de voz" : "Reproduzir nota de voz"}
                accessibilityRole="button"
                className="flex-row items-center gap-4 rounded-2xl border-2 border-feedback-danger/20 bg-feedback-danger-soft px-5 py-4"
                onPress={() => (playerStatus.playing ? player.pause() : player.play())}
                testID="diario-detail-play-nota-voz"
              >
                <View className="size-11 items-center justify-center rounded-pill bg-feedback-danger">
                  {playerStatus.playing ? (
                    <Pause color={nativePropColors.white} fill={nativePropColors.white} size={16} />
                  ) : (
                    <Play color={nativePropColors.white} fill={nativePropColors.white} size={16} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="font-sans-bold text-[14px] text-feedback-danger">Nota de voz</Text>
                  <Text className="font-sans text-[13px] text-feedback-danger/80">
                    {formatRecordingDuration(playerStatus.duration * 1000)}
                  </Text>
                </View>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
