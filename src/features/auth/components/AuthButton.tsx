import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native-css/components";

import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type AuthButtonVariant = "primary" | "secondary" | "ghost";

type AuthButtonProps = {
  disabled?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  onPress?: () => void;
  testID?: string;
  title: string;
  variant?: AuthButtonVariant;
};

const primaryColors = [nativePropColors.brandPrimary, nativePropColors.brandMint] as const;
const disabledColors = ["#b6c8c2", "#c8d7d2"] as const;

export function AuthButton({
  disabled,
  icon,
  loading,
  onPress,
  testID,
  title,
  variant = "primary",
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: loading, disabled: isDisabled }}
        disabled={isDisabled}
        onPress={onPress}
        style={({ pressed }) => [pressed && !isDisabled ? styles.pressed : undefined]}
        testID={testID}
      >
        <LinearGradient
          colors={isDisabled ? disabledColors : primaryColors}
          end={{ x: 1, y: 0 }}
          start={{ x: 0, y: 0 }}
          style={styles.primaryGradient}
        >
          <View className="min-h-14 flex-row items-center justify-center gap-2 px-5">
            {loading ? <ActivityIndicator color={nativePropColors.white} /> : icon}
            <Text className="font-sans-bold text-[15px] leading-[20px] text-white">{title}</Text>
          </View>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      className={cn(
        "min-h-14 flex-row items-center justify-center gap-2 rounded-pill px-5",
        variant === "secondary" && "border border-auth-line bg-auth-card",
        variant === "ghost" && "bg-transparent",
        isDisabled && "opacity-50",
      )}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [pressed && !isDisabled ? styles.pressed : undefined]}
      testID={testID}
    >
      {loading ? <ActivityIndicator color={nativePropColors.brandPrimary} /> : icon}
      <Text
        className={cn(
          "font-sans-bold text-[15px] leading-[20px]",
          variant === "secondary" ? "text-brand-primary" : "text-auth-muted",
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    transform: [{ translateY: 1 }],
  },
  primaryGradient: {
    borderRadius: 999,
    shadowColor: nativePropColors.brandPrimary,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
  },
});
