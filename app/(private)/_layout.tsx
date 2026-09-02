import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { getAccessToken } from "@/lib/auth/session";

export default function PrivateLayout() {
  const [accessToken, setAccessToken] = useState<string | null>();

  useEffect(() => {
    let mounted = true;

    getAccessToken()
      .then((token) => {
        if (mounted) {
          setAccessToken(token);
        }
      })
      .catch(() => {
        if (mounted) {
          setAccessToken(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (accessToken === undefined) {
    return <View className="flex-1 bg-home-canvas" />;
  }

  if (!accessToken) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
