import { Link, type Href } from "expo-router";
import { Pressable, Text } from "react-native-css/components";

import { cn } from "@/lib/cn";

type AuthLinkProps = {
  className?: string;
  href: Href;
  label: string;
  testID?: string;
};

export function AuthLink({ className, href, label, testID }: AuthLinkProps) {
  return (
    <Link asChild href={href}>
      <Pressable accessibilityRole="link" className={cn("min-h-11 justify-center", className)} testID={testID}>
        <Text className="text-center font-sans-bold text-[14px] leading-[20px] text-brand-primary">{label}</Text>
      </Pressable>
    </Link>
  );
}
