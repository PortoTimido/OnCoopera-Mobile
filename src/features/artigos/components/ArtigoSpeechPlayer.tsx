import { Pause, Play, Square, Volume2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { FormMessage } from "@/components/ui";
import { ARTIGO_SPEECH_RATES, type ArtigoSpeechRate, useArtigoSpeech } from "@/features/artigos/hooks/use-artigo-speech";
import { cn } from "@/lib/cn";
import type { Artigo } from "@/lib/api/artigos";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type ArtigoSpeechPlayerProps = {
  artigo: Artigo;
};

const rateLabels: Record<ArtigoSpeechRate, string> = {
  0.75: "0,75x",
  1: "1x",
  1.25: "1,25x",
  1.5: "1,5x",
};

const statusLabels = {
  error: "A leitura foi interrompida.",
  finished: "Leitura concluída.",
  idle: "Ouça este artigo em voz alta.",
  paused: "Leitura pausada.",
  speaking: "Lendo o artigo...",
  starting: "Preparando a leitura...",
} as const;

export function ArtigoSpeechPlayer({ artigo }: ArtigoSpeechPlayerProps) {
  const speech = useArtigoSpeech(artigo);
  const isActive = speech.status === "paused" || speech.status === "speaking" || speech.status === "starting";
  const isPaused = speech.status === "paused";
  const pauseDisabled = !speech.canPause || (speech.status !== "speaking" && speech.status !== "paused");
  const primaryLabel = isActive ? "Interromper leitura" : speech.status === "finished" ? "Ouvir artigo novamente" : "Iniciar leitura do artigo";

  return (
    <View className="gap-4 rounded-home-card border-2 border-home-lavender-border bg-home-lavender-soft p-5" testID="artigo-speech-player">
      <View className="flex-row items-center gap-3">
        <View className="size-11 items-center justify-center rounded-pill bg-home-lavender">
          <Volume2 color={nativePropColors.homeLavenderInk} size={21} strokeWidth={2.3} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-bold text-[15px] leading-[20px] text-home-lavender-ink">Ouvir artigo</Text>
          <Text
            accessibilityLiveRegion="polite"
            className="font-sans text-[13px] leading-[18px] text-home-muted"
            testID="artigo-speech-status"
          >
            {statusLabels[speech.status]}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <Pressable
          accessibilityHint={isActive ? "Interrompe imediatamente a narração" : "Lê o artigo completo em português brasileiro"}
          accessibilityLabel={primaryLabel}
          accessibilityRole="button"
          className="size-12 items-center justify-center rounded-pill bg-brand-primary"
          onPress={() => void (isActive ? speech.stop() : speech.start())}
          testID="artigo-speech-start-stop"
        >
          {isActive ? (
            <Square color={nativePropColors.white} fill={nativePropColors.white} size={16} />
          ) : (
            <Play color={nativePropColors.white} fill={nativePropColors.white} size={19} />
          )}
        </Pressable>

        <Pressable
          accessibilityHint={speech.canPause ? "Mantém a posição atual da leitura" : "O sintetizador do Android não oferece pausa e retomada"}
          accessibilityLabel={speech.canPause ? (isPaused ? "Retomar leitura" : "Pausar leitura") : "Pausar leitura indisponível no Android"}
          accessibilityRole="button"
          accessibilityState={{ disabled: pauseDisabled }}
          className={cn(
            "size-12 items-center justify-center rounded-pill border-2 border-home-lavender bg-home-surface",
            pauseDisabled && "opacity-40",
          )}
          disabled={pauseDisabled}
          onPress={() => void (isPaused ? speech.resume() : speech.pause())}
          testID="artigo-speech-pause-resume"
        >
          {isPaused ? (
            <Play color={nativePropColors.homeLavenderInk} fill={nativePropColors.homeLavenderInk} size={18} />
          ) : (
            <Pause color={nativePropColors.homeLavenderInk} fill={nativePropColors.homeLavenderInk} size={18} />
          )}
        </Pressable>

        <View className="ml-1 flex-1 flex-row flex-wrap justify-end gap-1.5">
          {ARTIGO_SPEECH_RATES.map((rate) => {
            const selected = speech.rate === rate;

            return (
              <Pressable
                accessibilityLabel={`Velocidade ${rateLabels[rate]}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                className={cn(
                  "min-h-11 min-w-12 items-center justify-center rounded-pill border px-2",
                  selected ? "border-brand-primary bg-brand-primary" : "border-home-lavender bg-home-surface",
                )}
                key={rate}
                onPress={() => speech.setRate(rate)}
                testID={`artigo-speech-rate-${rate}`}
              >
                <Text className={cn("font-sans-bold text-[12px]", selected ? "text-white" : "text-home-lavender-ink")}>
                  {rateLabels[rate]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {!speech.canPause ? (
        <Text className="font-sans text-[11px] leading-[16px] text-home-muted">Pausa e retomada não estão disponíveis no Android.</Text>
      ) : process.env.EXPO_OS === "ios" ? (
        <Text className="font-sans text-[11px] leading-[16px] text-home-muted">No iPhone, desative o modo silencioso para ouvir a leitura.</Text>
      ) : null}

      {speech.error ? <FormMessage message={speech.error} tone="error" /> : null}
    </View>
  );
}
