import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react-native";
import type { ComponentProps } from "react";
import { View } from "react-native-css/components";

import { AppText } from "@/components/ui/app-text";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type MessageTone = "error" | "success" | "info" | "warning";

const toneClasses: Record<MessageTone, string> = {
  error: "border-feedback-danger/20 bg-feedback-danger-soft",
  success: "border-feedback-success/20 bg-feedback-success-soft",
  info: "border-feedback-info/20 bg-feedback-info-soft",
  warning: "border-feedback-warning/20 bg-feedback-warning-soft",
};

const toneTextClasses: Record<MessageTone, string> = {
  error: "text-feedback-danger",
  success: "text-feedback-success",
  info: "text-feedback-info",
  warning: "text-feedback-warning",
};

const toneColors: Record<MessageTone, string> = {
  error: nativePropColors.danger,
  success: nativePropColors.success,
  info: nativePropColors.info,
  warning: nativePropColors.warning,
};

const toneIcons = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
};

type FormMessageProps = ComponentProps<typeof View> & {
  message?: string | null;
  tone?: MessageTone;
};

export function FormMessage({ className, message, tone = "error", ...props }: FormMessageProps) {
  if (!message) {
    return null;
  }

  const Icon = toneIcons[tone];

  return (
    <View
      accessible
      accessibilityRole="alert"
      className={cn("flex-row gap-2 rounded-3xl border px-4 py-3", toneClasses[tone], className)}
      {...props}
    >
      <Icon color={toneColors[tone]} size={18} strokeWidth={2.2} />
      <AppText className={cn("flex-1 font-sans-medium text-[13px] leading-[19px]", toneTextClasses[tone])}>
        {message}
      </AppText>
    </View>
  );
}
