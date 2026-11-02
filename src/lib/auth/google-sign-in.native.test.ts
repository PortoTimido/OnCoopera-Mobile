import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

import {
  getNativeGoogleIdToken,
  initializeNativeGoogleSignIn,
  isNativePlayServicesUnavailable,
} from "@/lib/auth/google-sign-in-native-adapter";

const configuration = {
  iosClientId: "123456.apps.googleusercontent.com",
  webClientId: "654321.apps.googleusercontent.com",
};

describe("native Google sign in adapter", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    initializeNativeGoogleSignIn(configuration);
  });

  it("configures the native SDK with the existing OAuth client IDs", () => {
    const configure = jest.spyOn(GoogleSignin, "configure");

    initializeNativeGoogleSignIn({
      iosClientId: "another-ios.apps.googleusercontent.com",
      webClientId: "another-web.apps.googleusercontent.com",
    });

    expect(configure).toHaveBeenCalledWith({
      iosClientId: "another-ios.apps.googleusercontent.com",
      offlineAccess: false,
      webClientId: "another-web.apps.googleusercontent.com",
    });
  });

  it("returns a trimmed ID token after a successful native sign in", async () => {
    jest.spyOn(GoogleSignin, "signIn").mockResolvedValue({
      data: {
        idToken: " google-id-token ",
        scopes: ["email", "profile"],
        serverAuthCode: null,
        user: {
          email: "paciente@oncoopera.com",
          familyName: "Silva",
          givenName: "Ana",
          id: "google-user",
          name: "Ana Silva",
          photo: null,
        },
      },
      type: "success",
    });

    await expect(getNativeGoogleIdToken()).resolves.toEqual({
      idToken: "google-id-token",
      type: "success",
    });
  });

  it("preserves cancellation without converting it into an error", async () => {
    jest.spyOn(GoogleSignin, "signIn").mockResolvedValue({ data: null, type: "cancelled" });

    await expect(getNativeGoogleIdToken()).resolves.toEqual({ type: "cancelled" });
  });

  it("recognizes the Google Play Services availability error", () => {
    expect(
      isNativePlayServicesUnavailable({ code: statusCodes.PLAY_SERVICES_NOT_AVAILABLE }),
    ).toBe(true);
  });
});
