import { useLocalSearchParams } from "expo-router";

import { ArtigoDetalheScreen } from "@/features/artigos/screens/ArtigoDetalheScreen";

export default function ArtigoDetalheRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ArtigoDetalheScreen id={id} />;
}
