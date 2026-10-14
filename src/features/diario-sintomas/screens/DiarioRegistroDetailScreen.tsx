import { useAudioPlayer, useAudioPlayerStatus, type AudioSource } from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import { Pause, Play } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { ScrollView, Text, View } from "react-native-css/components";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { buildNotaVozSource, getRegistroDiarioById, type RegistroDiario } from "@/lib/api/diario-sintomas";
import { getAccessToken } from "@/lib/auth/session";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { formatDataRegistroFull, formatIntensidade, formatRecordingDuration, getRegistroDate, HUMOR_LABEL, SINTOMA_LABEL } from "../diario-sintomas-formatters";

const OVERLAY_OPACITY = 0.6;
const CLOSE_DISTANCE_RATIO = 0.25;
const CLOSE_VELOCITY = 1_000;

function RegistroVoiceNotePlayer({ source }: { source: AudioSource }) {
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  return (
    <Pressable
      accessibilityLabel={status.playing ? "Pausar nota de voz do registro" : "Ouvir nota de voz do registro"}
      accessibilityRole="button"
      className="flex-row items-center gap-4 rounded-home-card border-2 border-feedback-danger/20 bg-feedback-danger-soft px-5 py-4"
      onPress={() => (status.playing ? player.pause() : player.play())}
      testID="diario-detail-play-nota-voz"
    >
      <View className="size-11 items-center justify-center rounded-pill bg-feedback-danger">
        {status.playing ? (
          <Pause color={nativePropColors.white} fill={nativePropColors.white} size={16} />
        ) : (
          <Play color={nativePropColors.white} fill={nativePropColors.white} size={16} />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-sans-bold text-[14px] text-feedback-danger">Nota de voz deste dia</Text>
        <Text className="font-sans text-[13px] text-feedback-danger/80">
          {status.duration > 0 ? formatRecordingDuration(status.duration * 1000) : "Toque para ouvir"}
        </Text>
      </View>
    </Pressable>
  );
}

export function DiarioRegistroDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [registro, setRegistro] = useState<RegistroDiario | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const isClosing = useRef(false);
  const sheetTranslateY = useSharedValue(height);
  const overlayOpacity = useSharedValue(0);

  const close = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    overlayOpacity.value = withTiming(0, { duration: 180 });
    sheetTranslateY.value = withTiming(height, { duration: 220 }, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  }, [height, overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    overlayOpacity.value = withTiming(OVERLAY_OPACITY, { duration: 220 });
    sheetTranslateY.value = withTiming(0, { duration: 280 });
  }, [overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });
    return () => subscription.remove();
  }, [close]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) {
        setError(true);
        return;
      }

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
  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTranslateY.value }] }));
  const panGesture = Gesture.Pan()
    .activeOffsetY([10, 9999])
    .onUpdate((event) => {
      sheetTranslateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > height * CLOSE_DISTANCE_RATIO || event.velocityY > CLOSE_VELOCITY) {
        runOnJS(close)();
        return;
      }
      sheetTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  return (
    <View style={styles.root} testID="diario-registro-detail-screen">
      <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
      <Pressable
        accessibilityLabel="Fechar detalhes do registro"
        accessibilityRole="button"
        onPress={close}
        style={StyleSheet.absoluteFill}
        testID="diario-registro-detail-backdrop"
      />
      <Animated.View style={[styles.sheet, { maxHeight: height * 0.88, paddingBottom: Math.max(insets.bottom, 32) }, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View className="items-center px-8 pb-5 pt-4" testID="diario-registro-detail-drag-handle">
            <View className="h-1.5 w-10 rounded-pill bg-radar-info-border" />
          </View>
        </GestureDetector>
        <ScrollView contentContainerClassName="gap-6 px-8 pb-2" showsVerticalScrollIndicator={false}>
          {!registro && !error ? (
            <View className="gap-6" testID="diario-registro-detail-skeleton">
              <View className="h-10 rounded-pill bg-radar-info" />
              <View className="h-16 rounded-home-card bg-radar-info" />
            </View>
          ) : null}
          {registro ? (
            <>
              <View className="items-center gap-3 pt-2">
                <AppText className="text-center text-[32px] leading-[39px] text-brand-primary" variant="title">
                  {formatDataRegistroFull(getRegistroDate(registro))}
                </AppText>
                <View className="rounded-pill bg-brand-soft px-5 py-2">
                  <Text className="font-sans-bold text-[12px] tracking-wide text-brand-primary">
                    {HUMOR_LABEL[registro.humor].toLocaleUpperCase("pt-BR")}
                  </Text>
                </View>
              </View>

              <View className="gap-3">
                {registro.sintomas.map((sintoma) => (
                  <View className="flex-row items-center justify-between rounded-home-card border-2 border-radar-info-border bg-radar-info px-6 py-5" key={sintoma.tipo}>
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

              {notaVozSource ? <RegistroVoiceNotePlayer source={notaVozSource} /> : null}
            </>
          ) : null}
          {error ? (
            <View className="items-center gap-3 py-10" testID="diario-registro-detail-error">
              <AppText className="text-center text-feedback-danger" variant="body">Não foi possível carregar este registro.</AppText>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "#000000" },
  root: { ...StyleSheet.absoluteFill, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: nativePropColors.white,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
});
