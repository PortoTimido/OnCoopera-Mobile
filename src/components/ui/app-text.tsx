import type { ComponentProps, ReactNode } from "react";
import { Text } from "react-native-css/components";

import { cn } from "@/lib/cn";

type TextVariant = "display" | "title" | "subtitle" | "body" | "label" | "caption";

const variantClasses: Record<TextVariant, string> = {
  display: "font-display text-[36px] leading-[42px] text-auth-ink",
  title: "font-display text-[30px] leading-[36px] text-auth-ink",
  subtitle: "font-sans-semibold text-[18px] leading-[26px] text-auth-ink",
  body: "font-sans text-[15px] leading-[23px] text-auth-muted",
  label: "font-sans-semibold text-[13px] leading-[18px] text-auth-ink",
  caption: "font-sans text-[12px] leading-[17px] text-auth-muted",
};

type AppTextProps = ComponentProps<typeof Text> & {
  children: ReactNode;
  variant?: TextVariant;
};

export function AppText({ children, className, variant = "body", ...props }: AppTextProps) {
  return (
    <Text className={cn(variantClasses[variant], className)} {...props}>
      {children}
    </Text>
  );
}
