import type { ExpoConfig } from "expo/config";

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
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
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
        apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
      },
    },
    package: "com.oncoopera.mobile",
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
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
        microphonePermission: "Permitir que o OnCoopera acesse o microfone para gravar notas de voz no diário de sintomas.",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission: "Permitir que o OnCoopera acesse sua localização para mostrar apoios próximos.",
      },
    ],
  ],
};

export default config;
