import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native-css/components";

import { getAccessToken, getPendingTermsAcceptance } from "@/lib/auth/session";

export default function IndexRoute() {
  const [destination, setDestination] = useState<"/inicio" | "/login" | "/aceitar-termos">();

  useEffect(() => {
    let active = true;

    Promise.all([getAccessToken(), getPendingTermsAcceptance()])
      .then(([accessToken, pending]) => {
        if (!active) return;
        setDestination(accessToken ? "/inicio" : pending ? "/aceitar-termos" : "/login");
      })
      .catch(() => {
        if (active) setDestination("/login");
      });

    return () => {
      active = false;
    };
  }, []);

  if (!destination) return <View className="flex-1 bg-auth-canvas" />;
  return <Redirect href={destination} />;
}
