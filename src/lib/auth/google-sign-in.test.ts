import Constants, { AppOwnership } from "expo-constants";

import {
  getGoogleIdToken,
  GoogleSignInError,
  initializeGoogleSignIn,
  isGoogleSignInAvailable,
} from "@/lib/auth/google-sign-in";

const mockInitializeNativeGoogleSignIn = jest.fn();
const mockGetNativeGoogleIdToken = jest.fn();
const mockIsNativePlayServicesUnavailable = jest.fn();
const mockSignOutNativeGoogle = jest.fn();

jest.mock("@/lib/auth/google-sign-in-native-adapter", () => ({
  getNativeGoogleIdToken: mockGetNativeGoogleIdToken,
  initializeNativeGoogleSignIn: mockInitializeNativeGoogleSignIn,
  isNativePlayServicesUnavailable: mockIsNativePlayServicesUnavailable,
  signOutNativeGoogle: mockSignOutNativeGoogle,
}));

const iosClientId = "123456.apps.googleusercontent.com";
const webClientId = "654321.apps.googleusercontent.com";

function enableGoogleSignIn() {
  process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_ENABLED = "true";
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID = iosClientId;
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID = webClientId;
}

describe("google sign in", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    enableGoogleSignIn();
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_ENABLED;
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    delete process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  });

  it("initializes the native SDK with the iOS and Web client IDs outside Expo Go", async () => {
    await expect(initializeGoogleSignIn()).resolves.toBe(true);
    expect(mockInitializeNativeGoogleSignIn).toHaveBeenCalledWith({
      iosClientId,
      webClientId,
    });
    expect(isGoogleSignInAvailable()).toBe(true);
  });

  it("returns the Google ID Token after a successful sign in", async () => {
    mockGetNativeGoogleIdToken.mockResolvedValue({ idToken: "google-id-token", type: "success" });

    await expect(getGoogleIdToken()).resolves.toEqual({
      idToken: "google-id-token",
      type: "success",
    });
  });

  it("returns cancellation without converting it into an error", async () => {
    mockGetNativeGoogleIdToken.mockResolvedValue({ type: "cancelled" });

    await expect(getGoogleIdToken()).resolves.toEqual({ type: "cancelled" });
  });

  it("rejects a successful response without an ID Token", async () => {
    mockGetNativeGoogleIdToken.mockResolvedValue({ idToken: null, type: "success" });

    await expect(getGoogleIdToken()).rejects.toMatchObject({
      reason: "missing-id-token",
    } satisfies Partial<GoogleSignInError>);
  });

  it("normalizes native failures without exposing their details", async () => {
    mockGetNativeGoogleIdToken.mockRejectedValue(new Error("native secret"));
    mockIsNativePlayServicesUnavailable.mockReturnValue(false);

    await expect(getGoogleIdToken()).rejects.toMatchObject({
      message: "Não foi possível autenticar com o Google.",
      reason: "authentication",
    } satisfies Partial<GoogleSignInError>);
  });

  it("rejects enabled environments without the required client IDs", async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

    await expect(initializeGoogleSignIn()).rejects.toMatchObject(
      expect.objectContaining({ reason: "configuration" }),
    );
  });

  it("does not load or initialize the native adapter in Expo Go", async () => {
    jest.replaceProperty(Constants, "appOwnership", AppOwnership.Expo);

    await expect(initializeGoogleSignIn()).resolves.toBe(false);
    await expect(getGoogleIdToken()).rejects.toMatchObject({ reason: "configuration" });
    expect(isGoogleSignInAvailable()).toBe(false);
    expect(mockInitializeNativeGoogleSignIn).not.toHaveBeenCalled();
    expect(mockGetNativeGoogleIdToken).not.toHaveBeenCalled();
  });
});
