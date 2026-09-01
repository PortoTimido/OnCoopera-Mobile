import "../src/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native-css/components";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useOnCooperaFonts } from "@/lib/fonts";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const { loaded, error } = useOnCooperaFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [error, loaded]);

  if (!loaded && !error) {
    return <View className="flex-1 bg-auth-canvas" />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
