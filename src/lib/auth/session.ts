import * as SecureStore from "expo-secure-store";

import type { AuthResponse, AuthenticatedUser } from "@/lib/api/auth";

const ACCESS_TOKEN_KEY = "oncoopera.accessToken";

type MemorySession = {
  accessToken: string;
  usuario: AuthenticatedUser;
} | null;

let memorySession: MemorySession = null;

export function getMemorySession() {
  return memorySession;
}

export function setMemorySession(session: AuthResponse | null) {
  memorySession = session;
}

export async function saveAuthSession(session: AuthResponse, remember: boolean) {
  setMemorySession(session);

  if (remember) {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, session.accessToken);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export async function getAccessToken() {
  return memorySession?.accessToken ?? SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function clearAuthSession() {
  setMemorySession(null);
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
