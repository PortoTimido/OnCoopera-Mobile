import { useCallback, useEffect, useState } from "react";

import { getPatientProfile } from "@/lib/api/auth";
import { type Apoio, type ApoioTipo, listApoios } from "@/lib/api/apoios";
import { getAccessToken } from "@/lib/auth/session";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export function useRadarApoio() {
  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");
  const [selectedType, setSelectedType] = useState<ApoioTipo | "todos">("todos");
  const [apoios, setApoios] = useState<Apoio[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadInitialCity() {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;
        const profile = await getPatientProfile(accessToken);
        if (mounted) setCity(profile.endereco?.cidade?.trim() ?? "");
      } catch {
        // The user can still type a city when their saved profile cannot be read.
      } finally {
        if (mounted) setIsProfileLoading(false);
      }
    }

    loadInitialCity();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedCity(city.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [city]);

  const loadPage = useCallback(
    async (nextPage: number, append = false) => {
      if (!debouncedCity) return;

      try {
        append ? setIsLoadingMore(true) : setIsLoading(true);
        setError(null);
        const response = await listApoios({
          cidade: debouncedCity,
          page: nextPage,
          pageSize: PAGE_SIZE,
          tipoApoio: selectedType === "todos" ? undefined : selectedType,
        });
        setApoios((current) => (append ? [...current, ...response.data] : response.data));
        setPage(response.page);
        setTotalPages(response.totalPages);
      } catch {
        setError("Não foi possível carregar os apoios. Tente novamente.");
      } finally {
        append ? setIsLoadingMore(false) : setIsLoading(false);
      }
    },
    [debouncedCity, selectedType],
  );

  useEffect(() => {
    if (!isProfileLoading) {
      setApoios([]);
      setPage(1);
      setTotalPages(0);
      setError(null);
      void loadPage(1);
    }
  }, [isProfileLoading, loadPage]);

  const retry = useCallback(() => void loadPage(1), [loadPage]);
  const loadMore = useCallback(() => void loadPage(page + 1, true), [loadPage, page]);

  return {
    apoios,
    city,
    error,
    hasMore: page < totalPages,
    isLoading: isProfileLoading || isLoading,
    isLoadingMore,
    loadMore,
    retry,
    selectedType,
    setCity,
    setSelectedType,
  };
}
