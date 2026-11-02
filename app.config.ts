import type { ExpoConfig } from "expo/config";

const GOOGLE_CLIENT_ID_SUFFIX = ".apps.googleusercontent.com";

function getGoogleIosUrlScheme(clientId: string) {
  if (!clientId.endsWith(GOOGLE_CLIENT_ID_SUFFIX)) {
    throw new Error(
      "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID deve ser um Client ID OAuth válido do iOS.",
    );
  }

  return `com.googleusercontent.apps.${clientId.slice(0, -GOOGLE_CLIENT_ID_SUFFIX.length)}`;
}

const googleSignInEnabled =
  process.env.EXPO_PUBLIC_GOOGLE_SIGN_IN_ENABLED === "true";
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim();
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

if (googleSignInEnabled && (!googleIosClientId || !googleWebClientId)) {
  throw new Error(
    "Google Sign-In habilitado sem EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID e EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.",
  );
}

const plugins: NonNullable<ExpoConfig["plugins"]> = [
  "expo-router",
  "expo-font",
  "expo-secure-store",
  [
    "expo-image-picker",
    {
      cameraPermission:
        "Permitir que o OnCoopera acesse a câmera para atualizar sua foto de perfil.",
      microphonePermission: false,
      photosPermission:
        "Permitir que o OnCoopera acesse suas fotos para atualizar sua foto de perfil.",
    },
  ],
  "expo-sharing",
  [
    "expo-splash-screen",
    {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
  ],
  [
    "expo-audio",
    {
      microphonePermission:
        "Permitir que o OnCoopera acesse o microfone para gravar notas de voz no diário de sintomas.",
    },
  ],
  [
    "expo-location",
    {
      locationWhenInUsePermission:
        "Permitir que o OnCoopera acesse sua localização para mostrar apoios próximos.",
    },
  ],
];

if (googleIosClientId) {
  plugins.push([
    "@react-native-google-signin/google-signin",
    { iosUrlScheme: getGoogleIosUrlScheme(googleIosClientId) },
  ]);
}

const config: ExpoConfig = {
  name: "OnCoopera-Mobile",
  slug: "OnCoopera-Mobile",
  scheme: "oncoopera",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",

  ios: {
    bundleIdentifier: "com.oncoopera.mobile",
    config: {
      googleMapsApiKey:
        process.env.GOOGLE_MAPS_IOS_API_KEY ??
        process.env.GOOGLE_MAPS_API_KEY,
    },
    supportsTablet: true,
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    config: {
      googleMaps: {
        apiKey:
          process.env.GOOGLE_MAPS_ANDROID_API_KEY ??
          process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    package: "com.oncoopera.mobile",
    predictiveBackGestureEnabled: false,
  },

  web: {
    favicon: "./assets/favicon.png",
  },

  extra: {
    eas: {
      projectId: "b6b860b8-9285-43f5-ad8e-54b46b8de5a5",
    },
  },

  plugins,
};

export default config;
