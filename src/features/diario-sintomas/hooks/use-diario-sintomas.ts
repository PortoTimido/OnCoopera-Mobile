import { useCallback, useEffect, useMemo, useState } from "react";

import { ApiError } from "@/lib/api/client";
import {
  type Humor,
  listRegistrosDiarios,
  getRegistroDiarioHoje,
  type RegistroDiario,
  saveRegistroDiarioHoje,
  type SintomaDiario,
  type SintomaTipo,
  type VoiceNoteFile,
} from "@/lib/api/diario-sintomas";
import { getAccessToken } from "@/lib/auth/session";

const HISTORY_PAGE_SIZE = 20;

type SintomaSelectionState = Partial<Record<SintomaTipo, { descricaoOutro?: string; intensidade: number }>>;

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function useDiarioSintomas() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [registroHojeId, setRegistroHojeId] = useState<string | null>(null);
  const [existingNotaVozUrl, setExistingNotaVozUrl] = useState<string | null>(null);
  const [removerNotaVozPending, setRemoverNotaVozPending] = useState(false);
  const [humor, setHumor] = useState<Humor | null>(null);
  const [sintomas, setSintomas] = useState<SintomaSelectionState>({});
  const [activeSintoma, setActiveSintoma] = useState<SintomaTipo | null>(null);

  const [history, setHistory] = useState<RegistroDiario[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const applyRegistro = useCallback((registro: RegistroDiario | null) => {
    setRegistroHojeId(registro?.id ?? null);
    setExistingNotaVozUrl(registro?.notaVozUrl ?? null);
    setRemoverNotaVozPending(false);
    setHumor(registro?.humor ?? null);

    const nextSintomas: SintomaSelectionState = {};
    for (const sintoma of registro?.sintomas ?? []) {
      nextSintomas[sintoma.tipo] = { descricaoOutro: sintoma.descricaoOutro ?? undefined, intensidade: sintoma.intensidade };
    }
    setSintomas(nextSintomas);
    setActiveSintoma(registro?.sintomas[0]?.tipo ?? null);
  }, []);

  const loadHistoryPage = useCallback(async (token: string, page: number, append: boolean) => {
    const response = await listRegistrosDiarios({ page, pageSize: HISTORY_PAGE_SIZE }, token);
    const today = todayIsoDate();
    const filtered = response.data.filter((registro) => registro.dataRegistro !== today);

    setHistory((current) => (append ? [...current, ...filtered] : filtered));
    setHistoryPage(response.page);
    setHistoryTotalPages(response.totalPages);
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        throw new Error("Sessão expirada. Entre novamente.");
      }

      setAccessToken(token);

      try {
        applyRegistro(await getRegistroDiarioHoje(token));
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 404)) {
          throw error;
        }
        applyRegistro(null);
      }

      await loadHistoryPage(token, 1, false);
    } catch {
      setLoadError("Não foi possível carregar o diário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [applyRegistro, loadHistoryPage]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const toggleSintoma = useCallback((tipo: SintomaTipo) => {
    setSintomas((current) => {
      if (current[tipo]) {
        const { [tipo]: _removed, ...rest } = current;
        return rest;
      }

      return { ...current, [tipo]: { intensidade: 5 } };
    });
    setActiveSintoma(tipo);
  }, []);

  useEffect(() => {
    if (activeSintoma && !sintomas[activeSintoma]) {
      const remaining = Object.keys(sintomas) as SintomaTipo[];
      setActiveSintoma(remaining[remaining.length - 1] ?? null);
    }
  }, [activeSintoma, sintomas]);

  const setIntensidade = useCallback((tipo: SintomaTipo, intensidade: number) => {
    setSintomas((current) => (current[tipo] ? { ...current, [tipo]: { ...current[tipo], intensidade } } : current));
  }, []);

  const setDescricaoOutro = useCallback((descricaoOutro: string) => {
    setSintomas((current) => (current.OUTRO ? { ...current, OUTRO: { ...current.OUTRO, descricaoOutro } } : current));
  }, []);

  const selectedSintomas = useMemo<SintomaDiario[]>(
    () =>
      (Object.entries(sintomas) as Array<[SintomaTipo, { descricaoOutro?: string; intensidade: number }]>).map(
        ([tipo, value]) => ({
          descricaoOutro: tipo === "OUTRO" ? (value.descricaoOutro?.trim() || null) : undefined,
          intensidade: value.intensidade,
          tipo,
        }),
      ),
    [sintomas],
  );

  const canSave = Boolean(humor) && selectedSintomas.length > 0;

  const save = useCallback(
    async (notaVoz?: VoiceNoteFile | null) => {
      if (!humor || selectedSintomas.length === 0) {
        setSaveError("Selecione seu humor e ao menos um sintoma para salvar.");
        return false;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        const token = await getAccessToken();

        if (!token) {
          throw new Error("Sessão expirada. Entre novamente.");
        }

        const registro = await saveRegistroDiarioHoje(
          { humor, notaVoz, removerNotaVoz: !notaVoz && removerNotaVozPending, sintomas: selectedSintomas },
          token,
        );

        applyRegistro(registro);
        return true;
      } catch (error) {
        setSaveError(error instanceof ApiError ? error.message : "Não foi possível salvar o registro do dia.");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [applyRegistro, humor, removerNotaVozPending, selectedSintomas],
  );

  const removeExistingNotaVoz = useCallback(() => {
    setExistingNotaVozUrl(null);
    setRemoverNotaVozPending(true);
  }, []);

  const loadMoreHistory = useCallback(async () => {
    if (isLoadingMoreHistory || historyPage >= historyTotalPages) return;

    setIsLoadingMoreHistory(true);
    try {
      const token = await getAccessToken();
      if (token) {
        await loadHistoryPage(token, historyPage + 1, true);
      }
    } finally {
      setIsLoadingMoreHistory(false);
    }
  }, [historyPage, historyTotalPages, isLoadingMoreHistory, loadHistoryPage]);

  return {
    accessToken,
    activeSintoma,
    canSave,
    existingNotaVozUrl,
    history,
    humor,
    hasMoreHistory: historyPage < historyTotalPages,
    isLoading,
    isLoadingMoreHistory,
    isSaving,
    loadError,
    loadMoreHistory,
    registroHojeId,
    removeExistingNotaVoz,
    retry: loadAll,
    save,
    saveError,
    selectedSintomas,
    setActiveSintoma,
    setDescricaoOutro,
    setHumor,
    setIntensidade,
    sintomas,
    toggleSintoma,
  };
}
