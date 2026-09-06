import { Link, type Href } from "expo-router";
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
  href?: Href;
  icon: IconComponent;
  id: string;
  label: string;
}> = [
  { href: "/inicio", icon: Home, id: "inicio", label: "Inicio" },
  { icon: ClipboardList, id: "diario", label: "Diario" },
  { icon: Sprout, id: "suporte", label: "Suporte" },
  { href: "/artigos", icon: BookOpen, id: "artigo", label: "Artigo" },
];

type HomeBottomNavProps = {
  activeId?: string;
};

export function HomeBottomNav({ activeId = "inicio" }: HomeBottomNavProps) {
  return (
    <View className="absolute bottom-0 left-0 right-0 rounded-t-home-nav border-t border-home-border bg-home-surface px-8 pb-4 pt-4 shadow-home-nav">
      <View className="mx-auto w-full max-w-home flex-row items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === activeId;
          const disabled = !item.href;
          const color = active ? nativePropColors.brandPrimary : nativePropColors.homeNavText;

          const button = (
            <Pressable
              accessibilityLabel={item.label}
              accessibilityRole="button"
              accessibilityState={{ disabled, selected: active || undefined }}
              className={cn("min-h-[48px] min-w-[62px] items-center justify-center gap-1 rounded-2xl px-2", active && "bg-home-green-soft")}
              disabled={disabled}
              key={item.id}
              testID={`home-nav-${item.id}`}
            >
              <Icon color={color} size={20} strokeWidth={2.2} />
              <Text
                className={cn(
                  "font-sans-bold text-[11px] leading-[14px]",
                  active ? "text-brand-primary" : "text-home-nav-text",
                )}
              >
                {item.label}
              </Text>
            </Pressable>
          );

          if (!item.href) {
            return button;
          }

          return (
            <Link asChild href={item.href} key={item.id}>
              {button}
            </Link>
          );
        })}
      </View>
    </View>
  );
}
