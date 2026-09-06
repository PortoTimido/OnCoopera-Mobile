import { Stack } from "expo-router";

export default function PublicLayout() {
  return <Stack screenOptions={{ animation: "fade", animationDuration: 220, headerShown: false }} />;
}
