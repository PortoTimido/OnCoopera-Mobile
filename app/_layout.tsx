import "../src/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native-css/components";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useOnCooperaFonts } from "@/lib/fonts";
import { initializeGoogleSignIn } from "@/lib/auth/google-sign-in";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const { error, retry, status } = useOnCooperaFonts();

  useEffect(() => {
    initializeGoogleSignIn().catch(() => {
      // A tela de login apresentará uma mensagem segura se a configuração estiver inválida.
    });
  }, []);

  useEffect(() => {
    if (status !== "loading") {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [status]);

  useEffect(() => {
    if (status === "error" && __DEV__) {
      console.error("Não foi possível carregar as fontes do OnCoopera.", error);
    }
  }, [error, status]);

  if (status === "loading") {
    return <View className="flex-1 bg-auth-canvas" />;
  }

  if (status === "error") {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-auth-canvas px-6" testID="font-load-error">
        <Text className="text-center text-[18px] leading-[26px] text-auth-ink">Não foi possível carregar as fontes do aplicativo.</Text>
        <Pressable
          accessibilityRole="button"
          className="rounded-pill bg-brand-primary px-6 py-3"
          onPress={retry}
          testID="font-load-retry"
        >
          <Text className="text-[15px] leading-[20px] text-white">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ animation: "fade", animationDuration: 220, headerShown: false }} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
