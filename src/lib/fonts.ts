import {
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { loadAsync } from "expo-font";
import { useCallback, useEffect, useState } from "react";

const onCooperaFonts = {
  "Fraunces-Bold": Fraunces_700Bold,
  "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
  "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
  "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
  "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
};

export type OnCooperaFontsStatus = "loading" | "ready" | "error";

export function useOnCooperaFonts() {
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<OnCooperaFontsStatus>("loading");
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    setStatus("loading");
    setError(null);

    loadAsync(onCooperaFonts)
      .then(() => {
        if (active) {
          setStatus("ready");
        }
      })
      .catch((caughtError: unknown) => {
        if (active) {
          setError(caughtError instanceof Error ? caughtError : new Error("Não foi possível carregar as fontes."));
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setAttempt((currentAttempt) => currentAttempt + 1);
  }, []);

  return {
    error,
    loaded: status === "ready",
    retry,
    status,
  };
}
