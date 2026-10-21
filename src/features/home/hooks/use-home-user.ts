import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { getMe } from "@/lib/api/auth";
import type { AuthenticatedUser } from "@/lib/api/auth";
import { useUserAvatar } from "@/features/auth/hooks/use-user-avatar";
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
  const [user, setUser] = useState<AuthenticatedUser | null>(() => getMemorySession()?.usuario ?? null);
  const { avatarUri } = useUserAvatar(user);

  useEffect(() => {
    if (user) {
      return undefined;
    }

    let mounted = true;

    async function loadUserName() {
      try {
        const token = await getAccessToken();

        if (!token) {
          if (mounted) {
            setUser(null);
          }
          return;
        }

        const user = await getMe(token);

        if (mounted) {
          setUser(user);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      }
    }

    loadUserName();

    return () => {
      mounted = false;
    };
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      const sessionUser = getMemorySession()?.usuario;

      if (sessionUser) {
        setUser(sessionUser);
      }
    }, []),
  );

  return useMemo(() => {
    const fullName = user?.nome.trim() || FALLBACK_USER_NAME;
    const displayName = getHomeUserShortName(fullName);

    return {
      displayName,
      initials: getHomeUserInitials(fullName),
      avatarUri,
    };
  }, [avatarUri, user]);
}
