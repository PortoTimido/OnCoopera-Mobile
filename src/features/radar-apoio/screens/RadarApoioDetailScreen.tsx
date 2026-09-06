import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Clock3, Map, MapPin, Phone } from "lucide-react-native";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { getApoioById, type Apoio } from "@/lib/api/apoios";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { APOIO_TIPO_LABEL, formatApoioAddress, formatApoioSchedule } from "../radar-apoio-formatters";

function DetailInformation({ children, icon, title }: { children: string; icon: ReactNode; title: string }) {
  return (
    <View className="gap-3 rounded-home-card border-2 border-radar-info-border bg-radar-info px-6 py-5">
      <View className="flex-row items-center gap-2">{icon}<Text className="font-sans-bold text-[14px] text-brand-primary">{title}</Text></View>
      <Text className="font-sans text-[15px] leading-[24px] text-home-muted">{children}</Text>
    </View>
  );
}

export function RadarApoioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [apoio, setApoio] = useState<Apoio | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) return undefined;
    getApoioById(id).then((result) => { if (mounted) setApoio(result); }).catch(() => { if (mounted) setError(true); });
    return () => { mounted = false; };
  }, [id]);

  if (!apoio && !error) {
    return <SafeAreaView style={{ backgroundColor: "#e5e5e5", flex: 1 }}><View className="flex-1 items-center justify-center"><ActivityIndicator color={nativePropColors.brandPrimary} /></View></SafeAreaView>;
  }

  if (!apoio) {
    return <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}><View className="flex-1 items-center justify-center gap-4 px-6"><AppText className="text-center text-feedback-danger" variant="body">Não foi possível carregar este apoio.</AppText><Pressable accessibilityLabel="Voltar para apoios" accessibilityRole="button" className="min-h-11 justify-center rounded-pill bg-brand-primary px-6" onPress={() => router.back()}><Text className="font-sans-bold text-[14px] text-white">Voltar</Text></Pressable></View></SafeAreaView>;
  }

  const address = formatApoioAddress(apoio);
  return (
    <SafeAreaView style={{ backgroundColor: "#e5e5e5", flex: 1 }}>
      <View className="flex-1 justify-end" testID="radar-apoio-detail-screen">
        <View className="max-h-[88%] rounded-t-radar-sheet bg-radar-sheet px-8 pb-8 pt-4 shadow-modal">
          <View className="mb-5 items-center"><View className="h-1.5 w-10 rounded-pill bg-radar-info-border" /></View>
          <Pressable accessibilityLabel="Voltar para apoios" accessibilityRole="button" className="absolute left-6 top-5 size-11 items-center justify-center rounded-pill bg-radar-info" hitSlop={8} onPress={() => router.back()}>
            <ArrowLeft color={nativePropColors.brandPrimary} size={21} strokeWidth={2.5} />
          </Pressable>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-2">
            <View className="items-center gap-3 pt-2">
              <AppText className="text-[32px] leading-[39px] text-brand-primary" variant="title">{apoio.nome}</AppText>
              <View className="rounded-pill bg-home-lavender px-5 py-2"><Text className="font-sans-bold text-[12px] tracking-wide text-home-lavender-ink">{APOIO_TIPO_LABEL[apoio.tipoApoio].toLocaleUpperCase("pt-BR")}</Text></View>
            </View>
            <DetailInformation icon={<MapPin color={nativePropColors.brandPrimary} size={18} strokeWidth={2.6} />} title="Endereço">{`${address.lineOne}\n${address.lineTwo}`}</DetailInformation>
            <DetailInformation icon={<Phone color={nativePropColors.brandPrimary} size={18} strokeWidth={2.6} />} title="Telefone">{apoio.telefone}</DetailInformation>
            <DetailInformation icon={<Clock3 color={nativePropColors.homeLavenderInk} size={18} strokeWidth={2.4} />} title="Horário">{formatApoioSchedule(apoio.horarios)}</DetailInformation>
            <Pressable accessibilityLabel="Como chegar estará disponível em breve" accessibilityRole="button" accessibilityState={{ disabled: true }} className="min-h-[52px] flex-row items-center justify-center gap-3 rounded-pill bg-brand-mint px-6" disabled testID="radar-directions-button">
              <Map color={nativePropColors.brandPrimary} size={22} strokeWidth={2.5} />
              <Text className="font-sans-bold text-[16px] text-brand-primary">Como chegar</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
