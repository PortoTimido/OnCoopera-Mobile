import { FlatList } from "react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { HomeBottomNav } from "@/features/home/components";
import { useHomeClock } from "@/features/home/hooks/use-home-clock";
import { useHomeUser } from "@/features/home/hooks/use-home-user";
import type { Apoio } from "@/lib/api/apoios";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { ApoioCard, RadarLocationInput, RadarMap, RadarTopBar, RadarTypeFilters } from "../components";
import { useRadarApoio } from "../hooks/use-radar-apoio";

export function RadarApoioListScreen() {
  const { dateTimeLabel } = useHomeClock();
  const { initials } = useHomeUser();
  const { apoios, city, error, hasMore, isLoading, isLoadingMore, loadMore, referenceCoordinates, retry, selectedType, setCity, setSelectedType, submitCity } = useRadarApoio();

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="radar-apoio-list-screen">
        <RadarTopBar dateTimeLabel={dateTimeLabel} initials={initials} />
        <FlatList
          className="flex-1"
          contentContainerClassName="mx-auto w-full max-w-home gap-6 px-6 pb-32 pt-7"
          data={apoios}
          ItemSeparatorComponent={() => <View className="h-5" />}
          keyExtractor={(apoio) => apoio.id}
          ListEmptyComponent={
            isLoading ? (
              <View className="items-center py-12"><ActivityIndicator color={nativePropColors.brandPrimary} /></View>
            ) : error ? (
              <View className="items-center gap-4 py-8">
                <AppText className="text-center text-feedback-danger" variant="body">{error}</AppText>
                <Pressable accessibilityLabel="Tentar carregar apoios novamente" accessibilityRole="button" className="min-h-11 justify-center rounded-pill bg-brand-primary px-6" onPress={retry}>
                  <Text className="font-sans-bold text-[14px] text-white">Tentar novamente</Text>
                </Pressable>
              </View>
            ) : (
              <AppText className="py-8 text-center text-home-muted" variant="body">Nenhum apoio encontrado para essa busca.</AppText>
            )
          }
          ListFooterComponent={
            apoios.length > 0 ? (
              <View className="items-center gap-3 pt-5">
                {isLoadingMore ? <View className="py-4"><ActivityIndicator color={nativePropColors.brandPrimary} /></View> : null}
                {error ? (
                  <>
                    <AppText className="text-center text-feedback-danger" variant="body">{error}</AppText>
                    <Pressable accessibilityLabel="Tentar carregar apoios novamente" accessibilityRole="button" className="min-h-11 justify-center rounded-pill bg-brand-primary px-6" onPress={retry}>
                      <Text className="font-sans-bold text-[14px] text-white">Tentar novamente</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View className="gap-6 pb-6">
              <View className="gap-1">
                <AppText className="text-[36px] leading-[42px] text-home-ink" variant="display">Radar de Apoio</AppText>
                <AppText className="max-w-[315px] text-[17px] leading-[24px] text-home-muted" variant="body">Encontre recursos e suporte próximos a você.</AppText>
              </View>
              <RadarLocationInput onBlur={submitCity} onChangeText={setCity} value={city} />
              <RadarTypeFilters onSelect={setSelectedType} selectedType={selectedType} />
              {apoios.length > 0 && referenceCoordinates ? <RadarMap apoios={apoios} location={referenceCoordinates} /> : null}
            </View>
          }
          onEndReached={() => {
            if (hasMore) void loadMore();
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }: { item: Apoio }) => <ApoioCard apoio={item} />}
          showsVerticalScrollIndicator={false}
          testID="radar-apoio-list"
        />
        <HomeBottomNav activeId="suporte" />
      </View>
    </SafeAreaView>
  );
}
