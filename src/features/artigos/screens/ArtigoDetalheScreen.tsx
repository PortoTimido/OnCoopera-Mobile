import { Clock3 } from "lucide-react-native";
import { ActivityIndicator, Image, ScrollView, Text, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { getArtigoContentBlocks, getArtigoResumo } from "@/features/artigos/artigo-content";
import { ArtigoCalloutCard, ArtigoDetalheTopBar } from "@/features/artigos/components";
import { useArtigo } from "@/features/artigos/hooks/use-artigo";
import { HomeBottomNav } from "@/features/home/components";
import type { Artigo } from "@/lib/api/artigos";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type ArtigoDetalheScreenProps = {
  id: string;
};

type ArtigoConteudoProps = {
  artigo: Artigo;
};

function ArtigoConteudo({ artigo }: ArtigoConteudoProps) {
  const resumo = getArtigoResumo(artigo.conteudo);
  const contentBlocks = getArtigoContentBlocks(artigo.conteudo);
  const resumoIndex = contentBlocks.findIndex((block) => block.type === "paragraph");

  return (
    <ScrollView
      className="flex-1 bg-home-canvas"
      contentContainerClassName="mx-auto w-full max-w-home gap-5 pb-32"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 pt-5">
        {artigo.imagemUrl ? (
          <View className="overflow-hidden rounded-home-card">
            <Image className="h-[220px] w-full" source={{ uri: artigo.imagemUrl }} />
            <View className="absolute bottom-4 right-4 flex-row items-center gap-1.5 rounded-pill bg-home-lavender/90 px-4 py-2">
              <Clock3 color={nativePropColors.homeLavenderInk} size={14} strokeWidth={2.4} />
              <Text className="font-sans-bold text-[12px] leading-[16px] text-home-lavender-ink">
                {artigo.tempoLeituraMinutos} min de leitura
              </Text>
            </View>
          </View>
        ) : (
          <View className="h-[80px] flex-row items-center gap-1.5 self-start rounded-pill bg-home-lavender/90 px-4 py-2">
            <Clock3 color={nativePropColors.homeLavenderInk} size={14} strokeWidth={2.4} />
            <Text className="font-sans-bold text-[12px] leading-[16px] text-home-lavender-ink">
              {artigo.tempoLeituraMinutos} min de leitura
            </Text>
          </View>
        )}
      </View>

      <View className="gap-5 px-6">
        <AppText className="text-[28px] leading-[34px] text-home-ink" variant="title">
          {artigo.titulo}
        </AppText>

        {resumo ? (
          <Text className="font-sans-bold text-[16px] leading-[26px] text-home-muted">{resumo}</Text>
        ) : null}

        {contentBlocks.map((block, index) => {
          if (block.type === "callout") {
            return <ArtigoCalloutCard {...block} key={`${artigo.id}-callout-${index}`} />;
          }

          if (index === resumoIndex) {
            return null;
          }

          return (
            <Text className="font-sans text-[15px] leading-[24px] text-home-ink" key={`${artigo.id}-p-${index}`}>
              {block.text}
            </Text>
          );
        })}
      </View>
    </ScrollView>
  );
}

export function ArtigoDetalheScreen({ id }: ArtigoDetalheScreenProps) {
  const { artigo, error, isLoading } = useArtigo(id);

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="artigo-detalhe-screen">
        <ArtigoDetalheTopBar />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={nativePropColors.brandPrimary} />
          </View>
        ) : error || !artigo ? (
          <View className="flex-1 items-center justify-center px-6">
            <AppText className="text-center text-feedback-danger" variant="body">
              {error ?? "Artigo nao encontrado."}
            </AppText>
          </View>
        ) : (
          <ArtigoConteudo artigo={artigo} />
        )}

        <HomeBottomNav activeId="artigo" />
      </View>
    </SafeAreaView>
  );
}
