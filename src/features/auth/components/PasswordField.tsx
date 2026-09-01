import { Eye, EyeOff, Lock } from "lucide-react-native";
import type { ComponentProps } from "react";
import { useState } from "react";
import { Pressable } from "react-native-css/components";

import { AuthTextField } from "@/features/auth/components/AuthTextField";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type PasswordFieldProps = Omit<ComponentProps<typeof AuthTextField>, "icon" | "secureTextEntry">;

export function PasswordField({ testID, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <AuthTextField
      autoCapitalize="none"
      autoCorrect={false}
      endAdornment={
        <Pressable
          accessibilityLabel={visible ? "Ocultar senha" : "Mostrar senha"}
          accessibilityRole="button"
          className="size-10 items-center justify-center rounded-full"
          onPress={() => setVisible((current) => !current)}
          testID={testID ? `${testID}-visibility-toggle` : undefined}
        >
          <Icon color={nativePropColors.authMuted} size={20} strokeWidth={2} />
        </Pressable>
      }
      icon={Lock}
      secureTextEntry={!visible}
      testID={testID}
      {...props}
    />
  );
}
