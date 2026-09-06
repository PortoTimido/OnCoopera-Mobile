import { useEffect, useMemo, useState } from "react";

import { type Artigo, listArtigos } from "@/lib/api/artigos";

const TODOS_TOPICOS_ID = "todos";

export type ArtigoTopico = {
  id: string;
  nome: string;
};

export function useArtigos() {
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedTopicoId, setSelectedTopicoId] = useState<string>(TODOS_TOPICOS_ID);

  useEffect(() => {
    let mounted = true;

    async function loadArtigos() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await listArtigos();

        if (mounted) {
          setArtigos(response.data);
        }
      } catch {
        if (mounted) {
          setError("Nao foi possivel carregar os artigos. Tente novamente.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadArtigos();

    return () => {
      mounted = false;
    };
  }, []);

  const topicos = useMemo<ArtigoTopico[]>(() => {
    const seen = new Map<string, string>();

    for (const artigo of artigos) {
      for (const categoria of artigo.categorias) {
        if (!seen.has(categoria.id)) {
          seen.set(categoria.id, categoria.nome);
        }
      }
    }

    return [{ id: TODOS_TOPICOS_ID, nome: "Todos Topicos" }, ...Array.from(seen, ([id, nome]) => ({ id, nome }))];
  }, [artigos]);

  const filteredArtigos = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return artigos.filter((artigo) => {
      const matchesTopico =
        selectedTopicoId === TODOS_TOPICOS_ID || artigo.categorias.some((categoria) => categoria.id === selectedTopicoId);

      const matchesSearch = !normalizedSearch || artigo.titulo.toLocaleLowerCase("pt-BR").includes(normalizedSearch);

      return matchesTopico && matchesSearch;
    });
  }, [artigos, search, selectedTopicoId]);

  return {
    artigos: filteredArtigos,
    error,
    isLoading,
    search,
    selectedTopicoId,
    setSearch,
    setSelectedTopicoId,
    topicos,
  };
}
