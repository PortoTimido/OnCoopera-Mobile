import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { File } from "expo-file-system";
import { useCallback, useEffect, useState } from "react";

export type VoiceRecorderStatus = "idle" | "paused" | "recorded" | "recording";

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
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [recordedDurationMillis, setRecordedDurationMillis] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (recorderState.isRecording) {
        recorder.stop().catch(() => undefined);
      }

      if (status !== "recorded") {
        deleteRecordingFile(recordedUri ?? recorder.uri);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const start = useCallback(async () => {
    setError(null);

    if (recordedUri) {
      deleteRecordingFile(recordedUri);
      setRecordedUri(null);
    }

    try {
      const current = await getRecordingPermissionsAsync();
      const granted = current.granted || (await requestRecordingPermissionsAsync()).granted;

      if (!granted) {
        setPermissionDenied(true);
        return;
      }

      setPermissionDenied(false);
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus("recording");
    } catch {
      setError("Não foi possível iniciar a gravação. Tente novamente.");
    }
  }, [recorder, recordedUri]);

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

      if (!recorder.uri) {
        setError("A gravação não pôde ser salva. Tente novamente.");
        setStatus("idle");
        return;
      }

      setRecordedDurationMillis(finishedDuration);
      setRecordedUri(recorder.uri);
      setStatus("recorded");
    } catch {
      setError("Não foi possível finalizar a gravação.");
      setStatus("idle");
    }
  }, [recorder, recorderState.durationMillis]);

  const cancel = useCallback(async () => {
    try {
      if (recorderState.isRecording) {
        await recorder.stop();
      }
    } catch {
      // Best-effort stop before discarding the recording.
    }

    deleteRecordingFile(recorder.uri ?? recordedUri);
    setRecordedUri(null);
    setRecordedDurationMillis(0);
    setError(null);
    setStatus("idle");
  }, [recorder, recorderState.isRecording, recordedUri]);

  const reset = useCallback(() => {
    deleteRecordingFile(recordedUri);
    setRecordedUri(null);
    setRecordedDurationMillis(0);
    setError(null);
    setStatus("idle");
  }, [recordedUri]);

  return {
    cancel,
    durationMillis: status === "recording" || status === "paused" ? recorderState.durationMillis : recordedDurationMillis,
    error,
    finish,
    pause,
    permissionDenied,
    recordedUri,
    reset,
    resume,
    start,
    status,
  };
}
