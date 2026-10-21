import { Info } from "lucide-react-native";
import type { ComponentProps } from "react";
import { View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type MedicalGuidanceNoticeProps = Omit<ComponentProps<typeof View>, "children">;

export const medicalGuidanceMessage =
  "As informações disponibilizadas pelo OnCoopera têm caráter informativo e não substituem avaliação, diagnóstico ou orientação de um profissional de saúde.";

export function MedicalGuidanceNotice({ className, ...props }: MedicalGuidanceNoticeProps) {
  return (
    <View
      accessible
      accessibilityLabel={medicalGuidanceMessage}
      className={cn("flex-row items-start gap-3 rounded-[28px] bg-brand-soft px-4 py-4", className)}
      {...props}
    >
      <View className="size-10 items-center justify-center rounded-pill bg-brand-primary">
        <Info color={nativePropColors.white} size={22} strokeWidth={2.8} />
      </View>
      <AppText className="flex-1 font-sans-medium text-[14px] leading-[20px] text-article-teal-ink">
        {medicalGuidanceMessage}
      </AppText>
    </View>
  );
}
