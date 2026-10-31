import type { AudioStatus } from "expo-audio";
import { useEffect } from "react";
import { Platform } from "react-native";

export type VoiceNotePlaybackMode = "localDownload" | "webBlob";

export function redactVoiceNoteDiagnostic(value: string | null | undefined) {
  return (
    value
      ?.replace(/Bearer\s+[^\s"']+/gi, "Bearer [redacted]")
      .replace(/https?:\/\/[^\s"'<>]+/gi, "[url]")
      .replace(/\b(?:eyJ[A-Za-z0-9_-]+\.){2}[A-Za-z0-9_-]+\b/g, "[token]") ??
    null
  );
}

/** Logs status transitions without source URLs or authorization headers. */
export function useVoiceNotePlaybackDiagnostics(
  status: AudioStatus,
  context: "today" | "history",
  mode: VoiceNotePlaybackMode,
) {
  const { duration, error, isBuffering, isLoaded, playbackState, playing } =
    status;
  const safeError = redactVoiceNoteDiagnostic(error);

  useEffect(() => {
    if (!__DEV__) return;

    const details = {
      context,
      duration,
      error: safeError,
      isBuffering,
      isLoaded,
      mode,
      platform: Platform.OS,
      playbackState,
      playing,
    };
    if (safeError) {
      console.warn("[diario-sintomas] playback-status", details);
    } else {
      console.info("[diario-sintomas] playback-status", details);
    }
  }, [
    context,
    duration,
    isBuffering,
    isLoaded,
    mode,
    playbackState,
    playing,
    safeError,
  ]);
}
