import { useEffect, useState } from "react";

import { type Artigo, getArtigoById } from "@/lib/api/artigos";

export function useArtigo(id: string | undefined) {
  const [artigo, setArtigo] = useState<Artigo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError("Artigo nao encontrado.");
      return undefined;
    }

    let mounted = true;

    async function loadArtigo() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getArtigoById(id as string);

        if (mounted) {
          setArtigo(response);
        }
      } catch {
        if (mounted) {
          setError("Nao foi possivel carregar este artigo. Tente novamente.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadArtigo();

    return () => {
      mounted = false;
    };
  }, [id]);

  return { artigo, error, isLoading };
}
