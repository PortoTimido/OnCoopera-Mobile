import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getMe } from "@/lib/api/auth";
import { getAccessToken, getMemorySession } from "@/lib/auth/session";

const FALLBACK_USER_NAME = "Paciente";

export function getHomeUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "P";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];

  return `${first}${last ?? ""}`.toLocaleUpperCase("pt-BR");
}

export function getHomeUserShortName(name: string) {
  const [firstName] = name.trim().split(/\s+/).filter(Boolean);

  return firstName ?? "";
}

export function useHomeUser() {
  const [name, setName] = useState(() => getMemorySession()?.usuario.nome ?? null);

  useEffect(() => {
    if (name) {
      return undefined;
    }

    let mounted = true;

    async function loadUserName() {
      try {
        const token = await getAccessToken();

        if (!token) {
          if (mounted) {
            setName(FALLBACK_USER_NAME);
          }
          return;
        }

        const user = await getMe(token);

        if (mounted) {
          setName(user.nome.trim() || FALLBACK_USER_NAME);
        }
      } catch {
        if (mounted) {
          setName(FALLBACK_USER_NAME);
        }
      }
    }

    loadUserName();

    return () => {
      mounted = false;
    };
  }, [name]);

  useFocusEffect(
    useCallback(() => {
      const sessionName = getMemorySession()?.usuario.nome;

      if (sessionName) {
        setName(sessionName);
      }
    }, []),
  );

  return useMemo(() => {
    const fullName = name?.trim() || FALLBACK_USER_NAME;
    const displayName = getHomeUserShortName(fullName);

    return {
      displayName,
      initials: getHomeUserInitials(fullName),
    };
  }, [name]);
}
