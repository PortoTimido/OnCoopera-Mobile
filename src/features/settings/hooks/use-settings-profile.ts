import { useEffect, useMemo, useState } from "react";

import { getMe } from "@/lib/api/auth";
import type { AuthenticatedUser } from "@/lib/api/auth";
import { useUserAvatar } from "@/features/auth/hooks/use-user-avatar";
import { getAccessToken, getMemorySession } from "@/lib/auth/session";

const FALLBACK_NAME = "Paciente";
const FALLBACK_EMAIL = "";

export function getSettingsUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "P";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];

  return `${first}${last ?? ""}`.toLocaleUpperCase("pt-BR");
}

export function useSettingsProfile() {
  const [profile, setProfile] = useState<AuthenticatedUser | null>(() => getMemorySession()?.usuario ?? null);
  const { avatarUri } = useUserAvatar(profile);

  useEffect(() => {
    if (profile) {
      return undefined;
    }

    let mounted = true;

    async function loadProfile() {
      try {
        const token = await getAccessToken();

        if (!token) {
          if (mounted) {
            setProfile(null);
          }
          return;
        }

        const user = await getMe(token);

        if (mounted) {
          setProfile(user);
        }
      } catch {
        if (mounted) {
          setProfile(null);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [profile]);

  return useMemo(() => {
    const name = profile?.nome.trim() || FALLBACK_NAME;
    const email = profile?.email ?? FALLBACK_EMAIL;

    return {
      email,
      avatarUri,
      initials: getSettingsUserInitials(name),
      name,
      user: profile,
      setProfile,
      setName: (nextName: string) => setProfile((current) => (current ? { ...current, nome: nextName } : current)),
    };
  }, [avatarUri, profile]);
}
