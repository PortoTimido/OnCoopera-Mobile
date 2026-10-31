import { File, Paths } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";

function avatarFile(userId: string) {
  return new File(Paths.cache, `oncoopera-avatar-${encodeURIComponent(userId)}.jpg`);
}

export function getCachedUserAvatarUri(userId: string) {
  const file = avatarFile(userId);
  return file.exists ? file.uri : null;
}

export async function cacheUserAvatarFromUrl(userId: string, imageUrl: string) {
  const response = await expoFetch(imageUrl);

  if (!response.ok) {
    throw new Error("Não foi possível baixar a foto de perfil.");
  }

  const file = avatarFile(userId);
  if (file.exists) {
    file.delete();
  }
  file.write(await response.bytes());

  return file.uri;
}

export async function cacheUserAvatarFromFile(userId: string, sourceUri: string) {
  const source = new File(sourceUri);
  const destination = avatarFile(userId);

  if (destination.exists) {
    destination.delete();
  }
  await source.copy(destination);

  return destination.uri;
}

export function clearCachedUserAvatar(userId: string) {
  const file = avatarFile(userId);
  if (file.exists) {
    file.delete();
  }
}
