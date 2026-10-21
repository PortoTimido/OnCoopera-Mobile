import { useCallback, useEffect, useState } from "react";

import type { AuthenticatedUser } from "@/lib/api/auth";
import { cacheUserAvatarFromUrl, clearCachedUserAvatar, getCachedUserAvatarUri } from "@/lib/auth/user-avatar-cache";

export function useUserAvatar(user: AuthenticatedUser | null | undefined) {
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const resolveAvatar = useCallback(async () => {
    if (!user?.id || !user.imagemUrl) {
      if (user?.id) clearCachedUserAvatar(user.id);
      setAvatarUri(null);
      return;
    }

    const cachedUri = getCachedUserAvatarUri(user.id);
    if (cachedUri) {
      setAvatarUri(cachedUri);
      return;
    }

    try {
      const downloadedUri = await cacheUserAvatarFromUrl(user.id, user.imagemUrl);
      setAvatarUri(downloadedUri);
    } catch {
      setAvatarUri(null);
    }
  }, [user?.id, user?.imagemUrl]);

  useEffect(() => {
    void resolveAvatar();
  }, [resolveAvatar]);

  return { avatarUri, refreshAvatar: resolveAvatar };
}
