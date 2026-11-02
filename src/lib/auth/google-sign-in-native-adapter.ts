import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { Platform } from "react-native";

import type { GoogleSignInConfiguration } from "./google-sign-in";

export type NativeGoogleIdTokenResult =
  | { type: "cancelled" }
  | { idToken: string | null; type: "success" };

let configuredClientIds: string | null = null;

export function initializeNativeGoogleSignIn(configuration: GoogleSignInConfiguration) {
  const configurationKey = `${configuration.iosClientId}:${configuration.webClientId}`;

  if (configuredClientIds !== configurationKey) {
    GoogleSignin.configure({
      iosClientId: configuration.iosClientId,
      offlineAccess: false,
      webClientId: configuration.webClientId,
    });
    configuredClientIds = configurationKey;
  }
}

export async function getNativeGoogleIdToken(): Promise<NativeGoogleIdTokenResult> {
  if (Platform.OS === "android") {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();

  if (isCancelledResponse(response)) {
    return { type: "cancelled" };
  }

  if (!isSuccessResponse(response)) {
    throw new Error("Resposta de autenticação Google inválida.");
  }

  return { idToken: response.data.idToken?.trim() || null, type: "success" };
}

export function isNativePlayServicesUnavailable(error: unknown) {
  return (
    isErrorWithCode(error) &&
    error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
  );
}

export async function signOutNativeGoogle() {
  if (GoogleSignin.getCurrentUser()) {
    await GoogleSignin.signOut();
  }
}
