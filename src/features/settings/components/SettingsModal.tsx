import type { ReactNode } from "react";
import { Modal } from "react-native";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native-css/components";

import { AppText } from "@/components/ui";

type SettingsModalProps = {
  children: ReactNode;
  onClose: () => void;
  testID?: string;
  title: string;
  visible: boolean;
};

export function SettingsModal({ children, onClose, testID, title, visible }: SettingsModalProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable
        accessibilityLabel="Fechar"
        accessibilityRole="button"
        className="flex-1 items-center justify-center px-6"
        onPress={onClose}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
        testID={testID ? `${testID}-backdrop` : undefined}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="w-full max-w-home"
        >
          <Pressable className="gap-5 rounded-home-card bg-home-surface p-6 shadow-modal" onPress={() => undefined} testID={testID}>
            <AppText className="text-[20px] leading-[26px] text-home-ink" variant="subtitle">
              {title}
            </AppText>

            <View className="gap-4">{children}</View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
