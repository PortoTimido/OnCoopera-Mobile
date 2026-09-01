import type { ReactNode } from "react";
import { Platform } from "react-native";
import { KeyboardAvoidingView, ScrollView, View } from "react-native-css/components";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type AuthShellProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  testID?: string;
};

export function AuthShell({ children, className, contentClassName, testID }: AuthShellProps) {
  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.authCanvas, flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 bg-auth-canvas"
        testID={testID}
      >
        <ScrollView
          className={cn("flex-1 bg-auth-canvas", className)}
          contentContainerClassName={cn("grow px-5 py-6", contentClassName)}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-auto w-full max-w-auth flex-1 justify-center gap-6">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
