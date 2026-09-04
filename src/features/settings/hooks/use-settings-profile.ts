import { useEffect, useMemo, useState } from "react";

import { getMe } from "@/lib/api/auth";
import { getAccessToken, getMemorySession } from "@/lib/auth/session";

const FALLBACK_NAME = "Paciente";
const FALLBACK_EMAIL = "";

type SettingsProfile = {
  email: string;
  name: string;
};

export function getSettingsUserInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "P";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1];

  return `${first}${last ?? ""}`.toLocaleUpperCase("pt-BR");
}

export function useSettingsProfile() {
  const [profile, setProfile] = useState<SettingsProfile | null>(() => {
    const session = getMemorySession();

    return session ? { email: session.usuario.email, name: session.usuario.nome } : null;
  });

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
            setProfile({ email: FALLBACK_EMAIL, name: FALLBACK_NAME });
          }
          return;
        }

        const user = await getMe(token);

        if (mounted) {
          setProfile({ email: user.email, name: user.nome.trim() || FALLBACK_NAME });
        }
      } catch {
        if (mounted) {
          setProfile({ email: FALLBACK_EMAIL, name: FALLBACK_NAME });
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [profile]);

  return useMemo(() => {
    const name = profile?.name.trim() || FALLBACK_NAME;
    const email = profile?.email ?? FALLBACK_EMAIL;

    return {
      email,
      initials: getSettingsUserInitials(name),
      name,
      setName: (nextName: string) => setProfile((current) => ({ email: current?.email ?? FALLBACK_EMAIL, name: nextName })),
    };
  }, [profile]);
}
