import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, ScrollView, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { ArtigoCard, ArtigoSearchInput, ArtigoTopicoChips, ArtigosTopBar } from "@/features/artigos/components";
import { useArtigos } from "@/features/artigos/hooks/use-artigos";
import { HomeBottomNav } from "@/features/home/components";
import { useHomeClock } from "@/features/home/hooks/use-home-clock";
import { useHomeUser } from "@/features/home/hooks/use-home-user";
import { nativePropColors } from "@/lib/design/native-prop-colors";

const END_REACHED_THRESHOLD_PX = 120;

function isCloseToBottom({ contentOffset, contentSize, layoutMeasurement }: NativeScrollEvent) {
  return contentOffset.y + layoutMeasurement.height >= contentSize.height - END_REACHED_THRESHOLD_PX;
}

export function ArtigosListScreen() {
  const { dateTimeLabel } = useHomeClock();
  const { initials } = useHomeUser();
  const { artigos, error, hasMore, isLoading, isLoadingMore, loadMore, search, selectedTopicoId, setSearch, setSelectedTopicoId, topicos } =
    useArtigos();

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    if (isCloseToBottom(event.nativeEvent)) {
      loadMore();
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="artigos-list-screen">
        <ArtigosTopBar dateTimeLabel={dateTimeLabel} initials={initials} />

        <ScrollView
          className="flex-1 bg-home-canvas"
          contentContainerClassName="mx-auto w-full max-w-home gap-5 px-6 pb-32 pt-6"
          contentInsetAdjustmentBehavior="automatic"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <ArtigoSearchInput onChangeText={setSearch} value={search} />

          <ArtigoTopicoChips onSelect={setSelectedTopicoId} selectedId={selectedTopicoId} topicos={topicos} />

          {isLoading ? (
            <View className="items-center pt-12">
              <ActivityIndicator color={nativePropColors.brandPrimary} />
            </View>
          ) : error ? (
            <AppText className="pt-12 text-center text-feedback-danger" variant="body">
              {error}
            </AppText>
          ) : artigos.length === 0 ? (
            <AppText className="pt-12 text-center text-home-muted" variant="body">
              Nenhum artigo encontrado.
            </AppText>
          ) : (
            <View className="gap-5">
              {artigos.map((artigo) => (
                <ArtigoCard artigo={artigo} key={artigo.id} />
              ))}

              {isLoadingMore ? (
                <View className="items-center py-4">
                  <ActivityIndicator color={nativePropColors.brandPrimary} />
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>

        <HomeBottomNav activeId="artigo" />
      </View>
    </SafeAreaView>
  );
}
