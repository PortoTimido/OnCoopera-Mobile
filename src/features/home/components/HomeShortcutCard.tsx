import { BookOpen, ClipboardList, Sprout } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import type { HomeShortcut } from "@/features/home/home.mock";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

const shortcutIcons: Record<HomeShortcut["id"], IconComponent> = {
  articles: BookOpen,
  diary: ClipboardList,
  support: Sprout,
};

const shortcutToneClasses: Record<HomeShortcut["tone"], { card: string; icon: string; label: string }> = {
  blue: {
    card: "border-home-blue-border bg-home-blue-soft",
    icon: "bg-home-blue",
    label: "text-home-blue-ink",
  },
  gold: {
    card: "border-home-gold-border bg-home-gold-soft",
    icon: "bg-home-gold",
    label: "text-home-gold-ink",
  },
  lavender: {
    card: "border-home-lavender-border bg-home-lavender-soft",
    icon: "bg-home-lavender",
    label: "text-home-lavender-ink",
  },
};

const shortcutToneColors: Record<HomeShortcut["tone"], string> = {
  blue: nativePropColors.white,
  gold: nativePropColors.white,
  lavender: nativePropColors.homeLavenderInk,
};

type HomeShortcutCardProps = {
  shortcut: HomeShortcut;
};

export function HomeShortcutCard({ shortcut }: HomeShortcutCardProps) {
  const Icon = shortcutIcons[shortcut.id];
  const tone = shortcutToneClasses[shortcut.tone];

  return (
    <Pressable
      accessibilityLabel={shortcut.label}
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      className={cn(
        "h-[142px] w-[47%] items-center justify-center gap-3 rounded-home-card border-2 shadow-home-clay",
        tone.card,
      )}
      disabled
      testID={`home-shortcut-${shortcut.id}`}
    >
      <View className={cn("size-14 items-center justify-center rounded-2xl shadow-home-soft", tone.icon)}>
        <Icon color={shortcutToneColors[shortcut.tone]} size={25} strokeWidth={2.4} />
      </View>
      <AppText className={cn("font-sans-bold text-[14px] leading-[20px]", tone.label)} variant="label">
        {shortcut.label}
      </AppText>
    </Pressable>
  );
}
