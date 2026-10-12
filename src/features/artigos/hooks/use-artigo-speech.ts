import { useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildArtigoNarrationSegments } from "@/features/artigos/artigo-speech";
import type { Artigo } from "@/lib/api/artigos";

export const ARTIGO_SPEECH_RATES = [0.75, 1, 1.25, 1.5] as const;

export type ArtigoSpeechRate = (typeof ARTIGO_SPEECH_RATES)[number];
export type ArtigoSpeechStatus = "error" | "finished" | "idle" | "paused" | "speaking" | "starting";

const SPEECH_ERROR_MESSAGE = "Não foi possível reproduzir a leitura. Tente novamente.";

function findBrazilianVoice(voices: Speech.Voice[]) {
  const brazilianVoices = voices.filter((voice) => voice.language.replace("_", "-").toLocaleLowerCase("en-US") === "pt-br");

  return brazilianVoices.find((voice) => voice.quality === Speech.VoiceQuality.Enhanced) ?? brazilianVoices[0];
}
export function useArtigoSpeech(artigo: Artigo, platform = process.env.EXPO_OS) {
  const narrationSegments = useMemo(
    () => buildArtigoNarrationSegments(artigo, Speech.maxSpeechInputLength),
    [artigo],
  );
  const [error, setError] = useState<string | null>(null);
  const [rate, setRateState] = useState<ArtigoSpeechRate>(1);
  const [status, setStatus] = useState<ArtigoSpeechStatus>("idle");
  const mountedRef = useRef(true);
  const narrationSegmentsRef = useRef(narrationSegments);
  const rateRef = useRef<ArtigoSpeechRate>(rate);
  const sessionRef = useRef(0);
  const voiceLoadRef = useRef<Promise<void> | null>(null);
  const voiceRef = useRef<string | undefined>(undefined);
  const canPause = platform !== "android";

  narrationSegmentsRef.current = narrationSegments;

  const setErrorState = useCallback((message: string) => {
    if (mountedRef.current) {
      setError(message);
      setStatus("error");
    }
  }, []);

  const speakSegment = useCallback(
    function speakSegmentAt(index: number, session: number) {
      if (sessionRef.current !== session) {
        return;
      }

      const segment = narrationSegmentsRef.current[index];

      if (!segment) {
        if (mountedRef.current) {
          setStatus("finished");
        }
        return;
      }

      try {
        Speech.speak(segment, {
          language: "pt-BR",
          onDone: () => speakSegmentAt(index + 1, session),
          onError: () => {
            if (sessionRef.current === session) {
              setErrorState(SPEECH_ERROR_MESSAGE);
            }
          },
          onPause: () => {
            if (sessionRef.current === session && mountedRef.current) {
              setStatus("paused");
            }
          },
          onResume: () => {
            if (sessionRef.current === session && mountedRef.current) {
              setStatus("speaking");
            }
          },
          onStart: () => {
            if (sessionRef.current === session && mountedRef.current) {
              setStatus("speaking");
            }
          },
          onStopped: () => {
            if (sessionRef.current === session && mountedRef.current) {
              setStatus("idle");
            }
          },
          rate: rateRef.current,
          voice: voiceRef.current,
        });
      } catch {
        if (sessionRef.current === session) {
          setErrorState(SPEECH_ERROR_MESSAGE);
        }
      }
    },
    [setErrorState],
  );

  const stop = useCallback(async () => {
    sessionRef.current += 1;

    try {
      await Speech.stop();
      if (mountedRef.current) {
        setError(null);
        setStatus("idle");
      }
    } catch {
      setErrorState(SPEECH_ERROR_MESSAGE);
    }
  }, [setErrorState]);

  const start = useCallback(async () => {
    const session = sessionRef.current + 1;
    sessionRef.current = session;

    if (mountedRef.current) {
      setError(null);
      setStatus("starting");
    }

    try {
      await Speech.stop();
      await voiceLoadRef.current;

      if (sessionRef.current === session) {
        speakSegment(0, session);
      }
    } catch {
      if (sessionRef.current === session) {
        setErrorState(SPEECH_ERROR_MESSAGE);
      }
    }
  }, [setErrorState, speakSegment]);

  const pause = useCallback(async () => {
    if (!canPause || status !== "speaking") {
      return;
    }

    try {
      await Speech.pause();
      if (mountedRef.current) {
        setStatus("paused");
      }
    } catch {
      setErrorState(SPEECH_ERROR_MESSAGE);
    }
  }, [canPause, setErrorState, status]);

  const resume = useCallback(async () => {
    if (!canPause || status !== "paused") {
      return;
    }

    try {
      await Speech.resume();
      if (mountedRef.current) {
        setStatus("speaking");
      }
    } catch {
      setErrorState(SPEECH_ERROR_MESSAGE);
    }
  }, [canPause, setErrorState, status]);

  const setRate = useCallback((nextRate: ArtigoSpeechRate) => {
    rateRef.current = nextRate;
    setRateState(nextRate);
  }, []);

  useEffect(() => {
    let active = true;

    voiceLoadRef.current = Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (active) {
          voiceRef.current = findBrazilianVoice(voices)?.identifier;
        }
      })
      .catch(() => {
        // `language: pt-BR` still lets the operating system choose its default voice.
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    sessionRef.current += 1;
    void Speech.stop();
    setError(null);
    setStatus("idle");
  }, [artigo.id]);

  useFocusEffect(
    useCallback(
      () => () => {
        void stop();
      },
      [stop],
    ),
  );

  useEffect(
    () => () => {
      mountedRef.current = false;
      sessionRef.current += 1;
      void Speech.stop();
    },
    [],
  );

  return { canPause, error, pause, rate, resume, setRate, start, status, stop };
}
