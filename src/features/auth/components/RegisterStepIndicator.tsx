import { View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { cn } from "@/lib/cn";

type RegisterStepIndicatorProps = {
  step: 1 | 2;
};

const STEPS: Array<{ label: string; value: 1 | 2 }> = [
  { label: "Seus dados", value: 1 },
  { label: "Endereco", value: 2 },
];

export function RegisterStepIndicator({ step }: RegisterStepIndicatorProps) {
  return (
    <View className="flex-row items-center justify-center gap-3">
      {STEPS.map((item, index) => (
        <View className="flex-row items-center gap-3" key={item.value}>
          <View className="items-center gap-1">
            <View
              className={cn(
                "size-8 items-center justify-center rounded-full border",
                step === item.value
                  ? "border-brand-primary bg-brand-primary"
                  : step > item.value
                    ? "border-brand-primary bg-brand-soft"
                    : "border-auth-line bg-auth-card",
              )}
            >
              <AppText
                className={cn(
                  "font-sans-bold text-[13px]",
                  step === item.value ? "text-white" : step > item.value ? "text-brand-primary" : "text-auth-muted",
                )}
                variant="caption"
              >
                {item.value}
              </AppText>
            </View>
            <AppText className={cn("text-[11px]", step === item.value ? "text-auth-ink" : "text-auth-muted")} variant="caption">
              {item.label}
            </AppText>
          </View>

          {index < STEPS.length - 1 ? <View className="mb-4 h-px w-6 bg-auth-line" /> : null}
        </View>
      ))}
    </View>
  );
}
