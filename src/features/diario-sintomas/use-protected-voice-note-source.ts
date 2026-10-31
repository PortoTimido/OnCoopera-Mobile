import type { AudioSource } from "expo-audio";
import { Platform } from "react-native";
import { useEffect, useState } from "react";

type ResolvedVoiceNoteSource = {
  revoke?: () => void;
  source: AudioSource;
};

function isRemoteSource(
  source: AudioSource,
): source is { headers?: Record<string, string>; uri: string } {
  return (
    typeof source === "object" &&
    source !== null &&
    "uri" in source &&
    typeof source.uri === "string"
  );
}

/**
 * The browser's HTMLAudioElement cannot attach an Authorization header to its
 * media request. Download protected audio first and hand the player a blob URL.
 * Native expo-audio players support request headers, so they retain streaming.
 */
export async function resolveProtectedVoiceNoteSource(
  source: AudioSource,
  platform = Platform.OS,
): Promise<ResolvedVoiceNoteSource> {
  if (platform !== "web" || !isRemoteSource(source)) {
    return { source };
  }

  const response = await fetch(
    source.uri,
    source.headers ? { headers: source.headers } : undefined,
  );
  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar a nota de voz (${response.status}).`,
    );
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  return {
    revoke: () => URL.revokeObjectURL(objectUrl),
    source: objectUrl,
  };
}

export function useProtectedVoiceNoteSource(source: AudioSource) {
  const [webSource, setWebSource] = useState<AudioSource>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Platform.OS === "web");
  const serializedSource = JSON.stringify(source);

  useEffect(() => {
    if (Platform.OS !== "web") {
      setError(null);
      setIsLoading(false);
      return;
    }

    let active = true;
    let resolved: ResolvedVoiceNoteSource | undefined;
    setWebSource(null);
    setError(null);
    setIsLoading(true);

    void resolveProtectedVoiceNoteSource(source)
      .then((next) => {
        resolved = next;
        if (!active) {
          next.revoke?.();
          return;
        }
        setWebSource(next.source);
      })
      .catch(() => {
        if (active)
          setError("Não foi possível carregar a nota de voz. Tente novamente.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      resolved?.revoke?.();
    };
  }, [serializedSource]);

  return {
    error,
    isLoading,
    source: Platform.OS === "web" ? webSource : source,
  };
}
