import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File } from "expo-file-system";
import { useCallback, useState } from "react";

export type VoiceRecorderStatus = "idle" | "paused" | "recorded" | "recording";

const shouldLogVoiceNoteDiagnostics = __DEV__;

function deleteRecordingFile(uri: string | null | undefined) {
  if (!uri) return;

  try {
    new File(uri).delete();
  } catch {
    // Best-effort cleanup of a temporary recording file.
  }
}

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);

    try {
      const current = await getRecordingPermissionsAsync();
      const granted =
        current.granted || (await requestRecordingPermissionsAsync()).granted;

      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      setPermissionDenied(false);
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus("recording");
    } catch {
      setError("Não foi possível iniciar a gravação. Tente novamente.");
    }
  }, [recorder]);

  const pause = useCallback(() => {
    recorder.pause();
    setStatus("paused");
  }, [recorder]);

  const resume = useCallback(() => {
    recorder.record();
    setStatus("recording");
  }, [recorder]);

  const finish = useCallback(async () => {
    try {
      const finishedDuration = recorderState.durationMillis;
      await recorder.stop();
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
      const uri = recorder.uri;

      if (!uri) {
        setError("A gravação não pôde ser salva. Tente novamente.");
        setStatus("idle");
        return null;
      }

      const recordingFile = new File(uri);
      if (!recordingFile.exists || recordingFile.size === 0) {
        if (shouldLogVoiceNoteDiagnostics) {
          console.warn("[diario-sintomas] voice-note-file-unavailable", {
            exists: recordingFile.exists,
            inferredMimeType: recordingFile.type || null,
            size: recordingFile.size,
            uriScheme: uri.split(":", 1)[0],
          });
        }
        setError("A gravação não pôde ser salva. Tente novamente.");
        setStatus("idle");
        return null;
      }

      if (shouldLogVoiceNoteDiagnostics) {
        console.info("[diario-sintomas] voice-note-recorded", {
          durationMillis: finishedDuration,
          extension:
            uri.split(/[?#]/, 1)[0]?.split(".").pop()?.toLowerCase() ?? null,
          inferredMimeType: recordingFile.type || null,
          size: recordingFile.size,
          uriScheme: uri.split(":", 1)[0],
        });
      }

      setStatus("recorded");
      return {
        durationMillis: finishedDuration,
        size: recordingFile.size,
        uri,
      };
    } catch {
      setError("Não foi possível finalizar a gravação.");
      setStatus("idle");
      return null;
    }
  }, [recorder, recorderState.durationMillis]);

  const cancel = useCallback(async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }

      deleteRecordingFile(recorder.uri);
    } catch {
      // Best-effort stop before discarding the recording.
    } finally {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    }

    setError(null);
    setStatus("idle");
  }, [recorder, recorderState.isRecording]);

  return {
    cancel,
    durationMillis: recorderState.durationMillis,
    error,
    finish,
    pause,
    permissionDenied,
    resume,
    start,
    status,
  };
}
