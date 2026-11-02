import * as SecureStore from "expo-secure-store";

import type { AuthResponse, AuthenticatedUser, PendingTermsAcceptanceResponse } from "@/lib/api/auth";

const ACCESS_TOKEN_KEY = "oncoopera.accessToken";
const PENDING_TERMS_ACCEPTANCE_KEY = "oncoopera.pendingTermsAcceptance";

type MemorySession = {
  accessToken: string;
  usuario: AuthenticatedUser;
} | null;

let memorySession: MemorySession = null;

export type PendingTermsAcceptance = PendingTermsAcceptanceResponse & { remember: boolean };

export function getMemorySession() {
  return memorySession;
}

export function setMemorySession(session: AuthResponse | null) {
  memorySession = session;
}

export function updateMemorySessionUser(patch: Partial<AuthenticatedUser>) {
  if (!memorySession) {
    return;
  }

  memorySession = { ...memorySession, usuario: { ...memorySession.usuario, ...patch } };
}

export async function saveAuthSession(session: AuthResponse, remember: boolean) {
  setMemorySession(session);
  await SecureStore.deleteItemAsync(PENDING_TERMS_ACCEPTANCE_KEY);

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

export async function savePendingTermsAcceptance(pending: PendingTermsAcceptance) {
  await SecureStore.setItemAsync(PENDING_TERMS_ACCEPTANCE_KEY, JSON.stringify(pending));
}

export async function getPendingTermsAcceptance(): Promise<PendingTermsAcceptance | null> {
  const raw = await SecureStore.getItemAsync(PENDING_TERMS_ACCEPTANCE_KEY);
  if (!raw) return null;

  try {
    const pending = JSON.parse(raw) as Partial<PendingTermsAcceptance>;
    if (
      pending.aceiteTermosUsoPendente !== true ||
      typeof pending.tokenAceite !== "string" ||
      !pending.tokenAceite ||
      typeof pending.remember !== "boolean" ||
      !pending.usuario
    ) {
      throw new Error("Estado de aceite pendente inválido.");
    }

    return pending as PendingTermsAcceptance;
  } catch {
    await clearPendingTermsAcceptance();
    return null;
  }
}

export function clearPendingTermsAcceptance() {
  return SecureStore.deleteItemAsync(PENDING_TERMS_ACCEPTANCE_KEY);
}
