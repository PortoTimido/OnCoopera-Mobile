import { useCallback, useEffect, useState } from "react";

import { type Artigo, listArtigos } from "@/lib/api/artigos";

const TODOS_TOPICOS_ID = "todos";
const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

export type ArtigoTopico = {
  id: string;
  nome: string;
};

export function useArtigos() {
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTopicoId, setSelectedTopicoId] = useState<string>(TODOS_TOPICOS_ID);
  const [topicos, setTopicos] = useState<ArtigoTopico[]>([{ id: TODOS_TOPICOS_ID, nome: "Todos Topicos" }]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search]);

  const loadPage = useCallback(
    async (nextPage: number, append = false) => {
      try {
        append ? setIsLoadingMore(true) : setIsLoading(true);
        setError(null);

        const response = await listArtigos({
          categoriaId: selectedTopicoId === TODOS_TOPICOS_ID ? undefined : selectedTopicoId,
          page: nextPage,
          pageSize: PAGE_SIZE,
          search: debouncedSearch || undefined,
        });

        setArtigos((current) => (append ? [...current, ...response.data] : response.data));
        setPage(response.page);
        setTotalPages(response.totalPages);

        setTopicos((current) => {
          const map = new Map(current.map((topico) => [topico.id, topico.nome]));

          for (const artigo of response.data) {
            for (const categoria of artigo.categorias) {
              if (!map.has(categoria.id)) {
                map.set(categoria.id, categoria.nome);
              }
            }
          }

          return Array.from(map, ([id, nome]) => ({ id, nome }));
        });
      } catch {
        setError("Nao foi possivel carregar os artigos. Tente novamente.");
      } finally {
        append ? setIsLoadingMore(false) : setIsLoading(false);
      }
    },
    [debouncedSearch, selectedTopicoId],
  );

  useEffect(() => {
    setArtigos([]);
    setPage(1);
    setTotalPages(0);
    void loadPage(1);
  }, [loadPage]);

  const hasMore = page < totalPages;

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    void loadPage(page + 1, true);
  }, [hasMore, isLoading, isLoadingMore, loadPage, page]);

  return {
    artigos,
    error,
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    search,
    selectedTopicoId,
    setSearch,
    setSelectedTopicoId,
    topicos,
  };
}
