import { useAudioPlayer, useAudioPlayerStatus, type AudioSource } from "expo-audio";
import { Mic, Pause, Play, Square, Trash2 } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import { Pressable, Text, View } from "react-native-css/components";

import { AppText, FormMessage } from "@/components/ui";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { formatRecordingDuration } from "../diario-sintomas-formatters";
import { useVoiceRecorder } from "../hooks/use-voice-recorder";

type DiarioVoiceNoteCardProps = {
  existingSource: AudioSource | null;
  onRemoveExisting: () => void;
  onRecordingChange: (recording: { durationMillis: number; uri: string } | null) => void;
  recording: { durationMillis: number; uri: string } | null;
};

function RecordingPulse() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { duration: 700, easing: Easing.out(Easing.ease), toValue: 1.6, useNativeDriver: true }),
        Animated.timing(scale, { duration: 0, toValue: 1, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  return (
    <Animated.View
      style={{
        backgroundColor: nativePropColors.danger,
        borderRadius: 999,
        height: 10,
        opacity: 0.5,
        position: "absolute",
        transform: [{ scale }],
        width: 10,
      }}
    />
  );
}

type VoiceNoteIdleProps = {
  error: string | null;
  onStart: () => void;
  permissionDenied: boolean;
};

function VoiceNoteIdle({ error, onStart, permissionDenied }: VoiceNoteIdleProps) {
  return (
    <View className="gap-2" testID="diario-voice-idle">
      <Pressable
        accessibilityLabel="Gravar nota de voz"
        accessibilityRole="button"
        className={cn(
          "flex-row items-center gap-4 rounded-home-card border-2 p-5",
          "border-feedback-danger/20 bg-feedback-danger-soft",
        )}
        onPress={onStart}
        testID="diario-voice-start"
      >
        <View className="size-12 items-center justify-center rounded-pill bg-feedback-danger">
          <Mic color={nativePropColors.white} size={22} strokeWidth={2.2} />
        </View>
        <View className="flex-1 gap-0.5">
          <AppText className="text-[15px] leading-[20px] text-feedback-danger" variant="subtitle">
            Nota de voz
          </AppText>
          <Text className="font-sans text-[13px] leading-[18px] text-feedback-danger/80">
            Descreva como se sente com suas próprias palavras.
          </Text>
        </View>
      </Pressable>

      {permissionDenied ? (
        <FormMessage message="Permita o acesso ao microfone nas configurações do dispositivo para gravar uma nota de voz." tone="warning" />
      ) : null}
      {error ? <FormMessage message={error} tone="error" /> : null}
    </View>
  );
}

function VoiceNotePlayback({ durationMillis, onRemove, source }: { durationMillis: number; onRemove: () => void; source: AudioSource }) {
  const player = useAudioPlayer(source);
  const playerStatus = useAudioPlayerStatus(player);

  return (
    <View className="gap-3 rounded-home-card border-2 border-feedback-danger/20 bg-feedback-danger-soft p-5" testID="diario-voice-recorded">
      <View className="flex-row items-center gap-4">
        <Pressable
          accessibilityLabel={playerStatus.playing ? "Pausar nota de voz" : "Reproduzir nota de voz"}
          accessibilityRole="button"
          className="size-12 items-center justify-center rounded-pill bg-feedback-danger"
          onPress={() => (playerStatus.playing ? player.pause() : player.play())}
          testID="diario-voice-play"
        >
          {playerStatus.playing ? (
            <Pause color={nativePropColors.white} fill={nativePropColors.white} size={18} />
          ) : (
            <Play color={nativePropColors.white} fill={nativePropColors.white} size={18} />
          )}
        </Pressable>

        <View className="flex-1">
          <AppText className="text-[15px] leading-[20px] text-feedback-danger" variant="subtitle">
            Nota de voz
          </AppText>
          <Text className="font-sans text-[13px] leading-[17px] text-feedback-danger/80">
            {formatRecordingDuration((playerStatus.duration || durationMillis / 1000) * 1000)}
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Excluir nota de voz"
          accessibilityRole="button"
          className="size-10 items-center justify-center rounded-pill bg-white"
          onPress={onRemove}
          testID="diario-voice-remove"
        >
          <Trash2 color={nativePropColors.danger} size={18} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

function VoiceNoteRecorder({
  onCancel,
  onComplete,
  onUnavailable,
}: {
  onCancel: () => void;
  onComplete: (recording: { durationMillis: number; uri: string }) => void;
  onUnavailable: (error: string | null, permissionDenied: boolean) => void;
}) {
  const recorder = useVoiceRecorder();

  useEffect(() => {
    void recorder.start();
  }, [recorder.start]);

  useEffect(() => {
    if (recorder.permissionDenied || recorder.error) {
      onUnavailable(recorder.error, recorder.permissionDenied);
    }
  }, [onUnavailable, recorder.error, recorder.permissionDenied]);

  const finish = async () => {
    const recording = await recorder.finish();

    if (recording) {
      onComplete(recording);
    }
  };

  return (
    <View className="gap-4 rounded-home-card border-2 border-feedback-danger/30 bg-feedback-danger-soft p-5" testID="diario-voice-recording">
      <View className="flex-row items-center gap-3">
        <View className="size-6 items-center justify-center">
          {recorder.status === "recording" ? <RecordingPulse /> : null}
          <View className="size-2.5 rounded-pill bg-feedback-danger" />
        </View>
        <AppText className="flex-1 text-[15px] leading-[20px] text-feedback-danger" variant="subtitle">
          {recorder.status === "recording" ? "Gravando nota de voz..." : "Preparando gravação..."}
        </AppText>
        <Text className="font-sans-bold text-[16px] text-feedback-danger" testID="diario-voice-duration">
          {formatRecordingDuration(recorder.durationMillis)}
        </Text>
      </View>

      <View className="flex-row justify-center gap-4">
        <Pressable
          accessibilityLabel="Cancelar gravação"
          accessibilityRole="button"
          className="size-12 items-center justify-center rounded-pill bg-white"
          onPress={() => {
            void recorder.cancel();
            onCancel();
          }}
          testID="diario-voice-cancel"
        >
          <Trash2 color={nativePropColors.danger} size={20} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          accessibilityLabel={recorder.status === "recording" ? "Pausar gravação" : "Retomar gravação"}
          accessibilityRole="button"
          className="size-14 items-center justify-center rounded-pill bg-feedback-danger"
          onPress={recorder.status === "recording" ? recorder.pause : recorder.resume}
          testID="diario-voice-pause-resume"
        >
          {recorder.status === "recording" ? <Pause color={nativePropColors.white} fill={nativePropColors.white} size={22} /> : <Mic color={nativePropColors.white} size={22} />}
        </Pressable>

        <Pressable
          accessibilityLabel="Finalizar gravação"
          accessibilityRole="button"
          className="size-12 items-center justify-center rounded-pill bg-white"
          onPress={() => void finish()}
          testID="diario-voice-finish"
        >
          <Square color={nativePropColors.brandPrimary} fill={nativePropColors.brandPrimary} size={16} />
        </Pressable>
      </View>
    </View>
  );
}

export function DiarioVoiceNoteCard({ existingSource, onRemoveExisting, onRecordingChange, recording }: DiarioVoiceNoteCardProps) {
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const openRecorder = () => {
    onRecordingChange(null);
    setRecorderError(null);
    setPermissionDenied(false);
    setIsRecorderOpen(true);
  };

  if (isRecorderOpen) {
    return (
      <VoiceNoteRecorder
        onCancel={() => setIsRecorderOpen(false)}
        onComplete={(nextRecording) => {
          onRecordingChange(nextRecording);
          setIsRecorderOpen(false);
        }}
        onUnavailable={(error, denied) => {
          setRecorderError(error);
          setPermissionDenied(denied);
          setIsRecorderOpen(false);
        }}
      />
    );
  }

  if (recording) {
    return (
      <View className="gap-3">
        <VoiceNotePlayback durationMillis={recording.durationMillis} onRemove={() => onRecordingChange(null)} source={recording.uri} />
        <Pressable accessibilityLabel="Regravar nota de voz" accessibilityRole="button" className="items-center rounded-pill border border-feedback-danger/30 py-2" onPress={openRecorder} testID="diario-voice-rerecord">
          <Text className="font-sans-bold text-[13px] text-feedback-danger">Regravar</Text>
        </Pressable>
      </View>
    );
  }

  if (existingSource) {
    return (
      <View className="gap-3">
        <VoiceNotePlayback durationMillis={0} onRemove={onRemoveExisting} source={existingSource} />
        <Pressable accessibilityLabel="Regravar nota de voz" accessibilityRole="button" className="items-center rounded-pill border border-feedback-danger/30 py-2" onPress={openRecorder} testID="diario-voice-rerecord">
          <Text className="font-sans-bold text-[13px] text-feedback-danger">Regravar</Text>
        </Pressable>
      </View>
    );
  }

  return <VoiceNoteIdle error={recorderError} onStart={openRecorder} permissionDenied={permissionDenied} />;
}
