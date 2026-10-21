import { Hospital } from "lucide-react-native";
import { Modal, useWindowDimensions } from "react-native";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { AuthButton } from "@/features/auth/components";
import { MedicalGuidanceNotice } from "@/features/home/components/MedicalGuidanceNotice";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type MedicalGuidanceModalProps = {
  onClose: () => void;
  visible: boolean;
};

export function MedicalGuidanceModal({ onClose, visible }: MedicalGuidanceModalProps) {
  const { height } = useWindowDimensions();

  if (!visible) {
    return null;
  }

  const needsScrollableContent = height < 720;
  const content = (
    <View className="items-center gap-4">
      <View className="size-20 items-center justify-center rounded-pill bg-brand-soft">
        <Hospital
          color={nativePropColors.brandPrimary}
          size={38}
          strokeWidth={2.2}
          testID="home-medical-guidance-hospital-icon"
        />
      </View>

      <AppText
        accessibilityRole="header"
        className="text-center font-sans-bold text-[28px] leading-[34px] text-brand-primary"
        variant="title"
      >
        Sempre consulte seu médico
      </AppText>

      <MedicalGuidanceNotice className="w-full" />

      <View className="w-full">
        <AuthButton onPress={onClose} testID="home-medical-guidance-confirm" title="Entendi" />
      </View>
    </View>
  );

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible>
      <Pressable
        accessibilityLabel="Fechar orientação médica"
        accessibilityRole="button"
        className="flex-1 items-center justify-center px-5 py-6"
        onPress={onClose}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
        testID="home-medical-guidance-modal-backdrop"
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="w-full max-w-home">
          <Pressable
            className="relative w-full overflow-hidden rounded-home-card bg-home-surface px-5 py-6 shadow-soft"
            onPress={() => undefined}
            style={needsScrollableContent ? { maxHeight: height - 48 } : undefined}
            testID="home-medical-guidance-modal"
          >
            <View className="absolute -right-16 -top-16 size-44 rounded-pill bg-brand-soft opacity-50" />

            {needsScrollableContent ? (
              <ScrollView bounces={false} contentContainerClassName="pb-1" showsVerticalScrollIndicator={false}>
                {content}
              </ScrollView>
            ) : (
              content
            )}
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
