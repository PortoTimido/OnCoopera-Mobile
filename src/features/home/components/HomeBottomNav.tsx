import { BookOpen, ClipboardList, Home, Sprout } from "lucide-react-native";
import type { ComponentType } from "react";
import { Pressable, Text, View } from "react-native-css/components";

import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

const navItems: Array<{
  active?: boolean;
  icon: IconComponent;
  id: string;
  label: string;
}> = [
  { active: true, icon: Home, id: "inicio", label: "Inicio" },
  { icon: ClipboardList, id: "diario", label: "Diario" },
  { icon: Sprout, id: "suporte", label: "Suporte" },
  { icon: BookOpen, id: "artigo", label: "Artigo" },
];

export function HomeBottomNav() {
  return (
    <View className="absolute bottom-0 left-0 right-0 rounded-t-home-nav border-t border-home-border bg-home-surface px-8 pb-4 pt-4 shadow-home-nav">
      <View className="mx-auto w-full max-w-home flex-row items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const color = item.active ? nativePropColors.brandPrimary : nativePropColors.homeNavText;

          return (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ disabled: !item.active, selected: item.active }}
              className={cn("min-h-[48px] min-w-[62px] items-center justify-center gap-1 rounded-2xl px-2", item.active && "bg-home-green-soft")}
              disabled={!item.active}
              key={item.id}
              testID={`home-nav-${item.id}`}
            >
              <Icon color={color} size={20} strokeWidth={2.2} />
              <Text
                className={cn(
                  "font-sans-bold text-[11px] leading-[14px]",
                  item.active ? "text-brand-primary" : "text-home-nav-text",
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
