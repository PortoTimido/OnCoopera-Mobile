import { CheckCircle2, Circle } from "lucide-react-native";
import { View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { passwordRules } from "@/features/auth/validation";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type PasswordChecklistProps = {
  password: string;
};

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  return (
    <View className="gap-2 rounded-[28px] bg-brand-soft px-4 py-3">
      {passwordRules(password).map((rule) => {
        const Icon = rule.valid ? CheckCircle2 : Circle;

        return (
          <View className="flex-row items-center gap-2" key={rule.id}>
            <Icon color={rule.valid ? nativePropColors.success : nativePropColors.authMuted} size={16} strokeWidth={2.1} />
            <AppText
              className={rule.valid ? "font-sans-medium text-feedback-success" : "font-sans text-auth-muted"}
              variant="caption"
            >
              {rule.label}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}
