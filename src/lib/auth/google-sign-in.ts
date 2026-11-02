import * as ExpoConstants from "expo-constants";
import { Platform } from "react-native";

export type GoogleSignInErrorReason =
  | "authentication"
  | "configuration"
  | "missing-id-token"
  | "play-services-unavailable";

export class GoogleSignInError extends Error {
  readonly reason: GoogleSignInErrorReason;

  constructor(reason: GoogleSignInErrorReason) {
    super("Não foi possível autenticar com o Google.");
    this.name = "GoogleSignInError";
    this.reason = reason;
  }
}

export type GoogleIdTokenResult =
  | { type: "cancelled" }
  | { idToken: string; type: "success" };

export type GoogleSignInConfiguration = {
  iosClientId: string;
  webClientId: string;
};

function isExpoGo() {
  const constants = ExpoConstants.default ?? ExpoConstants;

  return constants.appOwnership === "expo";
}

function getConfiguration(): GoogleSignInConfiguration | null {
  const enabled = process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true";
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

  if (!enabled || Platform.OS === "web" || isExpoGo()) {
    return null;
  }

  if (!iosClientId || !webClientId) {
    throw new GoogleSignInError("configuration");
  }

  return { iosClientId, webClientId };
}

function loadNativeGoogleSignIn() {
  // Metro registers this dependency, but require evaluates it only after this facade has
  // established that the current app is not Expo Go. This keeps Expo Go from resolving the
  // unavailable native Google Sign-In module.
  return require("./google-sign-in-native-adapter") as typeof import("./google-sign-in-native-adapter");
}

async function getConfiguredNativeGoogleSignIn() {
  const configuration = getConfiguration();

  if (!configuration) {
    return null;
  }

  const nativeGoogleSignIn = loadNativeGoogleSignIn();
  nativeGoogleSignIn.initializeNativeGoogleSignIn(configuration);

  return nativeGoogleSignIn;
}

export function isGoogleSignInAvailable() {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true" &&
    Platform.OS !== "web" &&
    !isExpoGo()
  );
}

export async function initializeGoogleSignIn() {
  return (await getConfiguredNativeGoogleSignIn()) !== null;
}

export async function getGoogleIdToken(): Promise<GoogleIdTokenResult> {
  const nativeGoogleSignIn = await getConfiguredNativeGoogleSignIn();

  if (!nativeGoogleSignIn) {
    throw new GoogleSignInError("configuration");
  }

  try {
    const response = await nativeGoogleSignIn.getNativeGoogleIdToken();

    if (response.type === "cancelled") {
      return response;
    }

    if (!response.idToken) {
      throw new GoogleSignInError("missing-id-token");
    }

    return { idToken: response.idToken, type: "success" };
  } catch (error) {
    if (error instanceof GoogleSignInError) {
      throw error;
    }

    if (nativeGoogleSignIn.isNativePlayServicesUnavailable(error)) {
      throw new GoogleSignInError("play-services-unavailable");
    }

    throw new GoogleSignInError("authentication");
  }
}

export async function signOutGoogle() {
  try {
    const nativeGoogleSignIn = await getConfiguredNativeGoogleSignIn();
    await nativeGoogleSignIn?.signOutNativeGoogle();
  } catch {
    // O logout local do OnCoopera não pode depender do provedor externo.
  }
}
