import type { AudioSource } from "expo-audio";
import { File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { useEffect, useState } from "react";

type ResolvedVoiceNoteSource = {
  revoke?: () => void;
  source: AudioSource;
};

function createCachedVoiceNoteFile() {
  return new File(
    Paths.cache,
    `diario-nota-voz-${Date.now()}-${Math.random().toString(36).slice(2)}.m4a`,
  );
}

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
 * Protected media is materialized locally before playback. This retains the
 * authorization header during the download and gives native players a stable
 * .m4a extension even when the protected endpoint has no file extension.
 */
export async function resolveProtectedVoiceNoteSource(
  source: AudioSource,
  platform = Platform.OS,
): Promise<ResolvedVoiceNoteSource> {
  if (!isRemoteSource(source)) {
    return { source };
  }

  if (platform === "web") {
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

  const destination = createCachedVoiceNoteFile();
  let file: File;
  try {
    file = await File.downloadFileAsync(source.uri, destination, {
      headers: source.headers,
    });
  } catch (error) {
    try {
      destination.delete();
    } catch {
      // Android can leave a partial cache file after a failed download.
    }
    throw error;
  }

  return {
    revoke: () => {
      try {
        file.delete();
      } catch {
        // Cache cleanup must not interfere with navigation or playback.
      }
    },
    source: file.uri,
  };
}

export function useProtectedVoiceNoteSource(source: AudioSource) {
  const [resolvedSource, setResolvedSource] = useState<AudioSource>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(isRemoteSource(source));
  const serializedSource = JSON.stringify(source);

  useEffect(() => {
    let active = true;
    let resolved: ResolvedVoiceNoteSource | undefined;
    setResolvedSource(null);
    setError(null);
    setIsLoading(isRemoteSource(source));

    if (!isRemoteSource(source)) {
      setResolvedSource(source);
      return () => {
        active = false;
      };
    }

    void resolveProtectedVoiceNoteSource(source)
      .then((next) => {
        resolved = next;
        if (!active) {
          next.revoke?.();
          return;
        }
        setResolvedSource(next.source);
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
    source: resolvedSource,
  };
}
