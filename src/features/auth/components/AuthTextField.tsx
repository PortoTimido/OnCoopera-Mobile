import type { ComponentProps, ComponentType, ReactNode } from "react";
import { useState } from "react";
import { TextInput, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

type AuthTextFieldProps = Omit<ComponentProps<typeof TextInput>, "className"> & {
  containerClassName?: string;
  endAdornment?: ReactNode;
  error?: string;
  helperText?: string;
  icon?: IconComponent;
  inputClassName?: string;
  label: string;
};

export function AuthTextField({
  containerClassName,
  endAdornment,
  error,
  helperText,
  icon: Icon,
  inputClassName,
  label,
  onBlur,
  onFocus,
  placeholderTextColor = nativePropColors.authPlaceholder,
  ...props
}: AuthTextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={cn("gap-2", containerClassName)}>
      <AppText className="font-sans-semibold text-[12px] uppercase text-auth-muted" variant="caption">
        {label}
      </AppText>

      <View
        className={cn(
          "min-h-14 flex-row items-center gap-3 rounded-pill border bg-auth-field px-4",
          focused ? "border-brand-mint" : "border-transparent",
          error && "border-feedback-danger bg-feedback-danger-soft",
        )}
      >
        {Icon ? <Icon color={error ? nativePropColors.danger : nativePropColors.authMuted} size={20} strokeWidth={2} /> : null}
        <TextInput
          accessibilityLabel={label}
          autoCapitalize="none"
          className={cn("min-h-14 flex-1 py-0 font-sans text-[15px] leading-[20px] text-auth-ink", inputClassName)}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={placeholderTextColor}
          {...props}
        />
        {endAdornment}
      </View>

      {error ? (
        <AppText className="text-feedback-danger" variant="caption">
          {error}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption">{helperText}</AppText>
      ) : null}
    </View>
  );
}
