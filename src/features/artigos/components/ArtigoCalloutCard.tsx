import { Lightbulb, NotebookTabs } from "lucide-react-native";
import { Text, View } from "react-native-css/components";

import type { ArtigoContentBlock } from "@/features/artigos/artigo-content";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type ArtigoCalloutCardProps = Extract<ArtigoContentBlock, { type: "callout" }>;

const calloutAppearance = {
  dica: {
    background: "bg-article-callout-tip",
    border: "border-article-callout-tip-border",
    color: nativePropColors.articleTealInk,
    icon: Lightbulb,
    ink: "text-article-teal-ink",
    title: "Dica",
  },
  pergunta: {
    background: "bg-article-callout-question",
    border: "border-article-callout-question-border",
    color: nativePropColors.articleGoldInk,
    icon: NotebookTabs,
    ink: "text-article-gold-ink",
    title: "Pergunte ao seu médico",
  },
} as const;

export function ArtigoCalloutCard({ paragraphs, variant }: ArtigoCalloutCardProps) {
  const appearance = calloutAppearance[variant];
  const Icon = appearance.icon;

  return (
    <View
      accessibilityLabel={appearance.title}
      className={cn("gap-4 rounded-[40px] border-2 px-8 py-8 shadow-home-clay", appearance.background, appearance.border)}
      testID={`artigo-callout-${variant}`}
    >
      <View className="flex-row items-center gap-4">
        <Icon color={appearance.color} size={32} strokeWidth={2.5} />
        <Text className={cn("font-sans-bold text-[25px] leading-[31px]", appearance.ink)}>{appearance.title}</Text>
      </View>

      <View className="gap-3 pl-[56px]">
        {paragraphs.map((paragraph, index) => (
          <Text className={cn("font-sans text-[18px] leading-[27px]", appearance.ink)} key={`${variant}-${index}`}>
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
}
