import type { ComponentProps } from "react";
import { View } from "react-native-css/components";

import { cn } from "@/lib/cn";

type AuthCardProps = ComponentProps<typeof View>;

export function AuthCard({ className, ...props }: AuthCardProps) {
  return (
    <View
      className={cn("gap-5 rounded-card-auth bg-auth-card px-6 py-7 shadow-card-auth elevation-md", className)}
      {...props}
    />
  );
}
