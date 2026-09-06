import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { HomeBottomNav } from "@/features/home/components";
import { useHomeClock } from "@/features/home/hooks/use-home-clock";
import { useHomeUser } from "@/features/home/hooks/use-home-user";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { ApoioCard, RadarLocationInput, RadarStaticMap, RadarTopBar, RadarTypeFilters } from "../components";
import { useRadarApoio } from "../hooks/use-radar-apoio";

export function RadarApoioListScreen() {
  const { dateTimeLabel } = useHomeClock();
  const { initials } = useHomeUser();
  const { apoios, city, error, hasMore, isLoading, isLoadingMore, loadMore, retry, selectedType, setCity, setSelectedType } = useRadarApoio();

  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="radar-apoio-list-screen">
        <RadarTopBar dateTimeLabel={dateTimeLabel} initials={initials} />
        <ScrollView className="flex-1" contentContainerClassName="mx-auto w-full max-w-home gap-6 px-6 pb-32 pt-7" showsVerticalScrollIndicator={false}>
          <View className="gap-1">
            <AppText className="text-[36px] leading-[42px] text-home-ink" variant="display">Radar de Apoio</AppText>
            <AppText className="max-w-[315px] text-[17px] leading-[24px] text-home-muted" variant="body">Encontre recursos e suporte próximos a você.</AppText>
          </View>

          <RadarLocationInput onChangeText={setCity} value={city} />
          <RadarTypeFilters onSelect={setSelectedType} selectedType={selectedType} />

          {isLoading ? (
            <View className="items-center py-12"><ActivityIndicator color={nativePropColors.brandPrimary} /></View>
          ) : !city.trim() ? (
            <AppText className="py-8 text-center text-home-muted" variant="body">Informe uma cidade para encontrar apoios próximos.</AppText>
          ) : error ? (
            <View className="items-center gap-4 py-8">
              <AppText className="text-center text-feedback-danger" variant="body">{error}</AppText>
              <Pressable accessibilityLabel="Tentar carregar apoios novamente" accessibilityRole="button" className="min-h-11 justify-center rounded-pill bg-brand-primary px-6" onPress={retry}>
                <Text className="font-sans-bold text-[14px] text-white">Tentar novamente</Text>
              </Pressable>
            </View>
          ) : apoios.length === 0 ? (
            <AppText className="py-8 text-center text-home-muted" variant="body">Nenhum apoio encontrado para essa busca.</AppText>
          ) : (
            <>
              <RadarStaticMap apoios={apoios} />
              <View className="gap-5">
                {apoios.map((apoio) => <ApoioCard apoio={apoio} key={apoio.id} />)}
              </View>
              {hasMore ? (
                <Pressable accessibilityLabel="Carregar mais apoios" accessibilityRole="button" accessibilityState={{ disabled: isLoadingMore }} className="min-h-12 items-center justify-center rounded-pill border-2 border-brand-primary px-6" disabled={isLoadingMore} onPress={loadMore}>
                  {isLoadingMore ? <ActivityIndicator color={nativePropColors.brandPrimary} /> : <Text className="font-sans-bold text-[14px] text-brand-primary">Carregar mais</Text>}
                </Pressable>
              ) : null}
            </>
          )}
        </ScrollView>
        <HomeBottomNav activeId="suporte" />
      </View>
    </SafeAreaView>
  );
}
