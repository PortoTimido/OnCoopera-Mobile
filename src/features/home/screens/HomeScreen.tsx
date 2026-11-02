import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, View } from "react-native-css/components";

import { AppText, AppTopBar } from "@/components/ui";
import {
  HomeBottomNav,
  HomeShortcutCard,
  MedicalGuidanceModal,
  MedicalGuidanceNotice,
} from "@/features/home/components";
import { homeMock } from "@/features/home/home.mock";
import { useHomeClock } from "@/features/home/hooks/use-home-clock";
import { useHomeUser } from "@/features/home/hooks/use-home-user";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ medicalGuidance?: string }>();
  const { dateTimeLabel, greeting } = useHomeClock();
  const { avatarUri, displayName, initials } = useHomeUser();
  const [medicalGuidanceVisible, setMedicalGuidanceVisible] = useState(() => params.medicalGuidance === "1");
  const medicalGuidanceHandled = useRef(false);

  useEffect(() => {
    if (params.medicalGuidance === "1" && !medicalGuidanceHandled.current) {
      medicalGuidanceHandled.current = true;
      setMedicalGuidanceVisible(true);
      router.setParams({ medicalGuidance: undefined });
    }
  }, [params.medicalGuidance, router]);

  return (
    <SafeAreaView edges={[]} style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="home-screen">
        <AppTopBar avatarUri={avatarUri} dateTimeLabel={dateTimeLabel} initials={initials} title="Início" />

        <ScrollView
          className="flex-1 bg-home-canvas"
          contentContainerClassName="mx-auto w-full max-w-home gap-9 px-6 pb-32 pt-[62px]"
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <AppText className="text-[30px] leading-[36px] text-home-ink" variant="title">
                {greeting.label}
              </AppText>
              <Text accessibilityLabel={greeting.emoji} className="text-[24px] leading-[30px]">
                {greeting.emoji}
              </Text>
            </View>
            <AppText className="text-[30px] leading-[36px] text-brand-primary" variant="title">
              {displayName}
            </AppText>
            <Text className="font-sans text-[14px] leading-[20px] text-home-muted">
              Como você está se sentindo neste momento?
            </Text>
          </View>

          <MedicalGuidanceNotice testID="home-medical-guidance-notice" />

          <View className="flex-row flex-wrap justify-between gap-y-8">
            {homeMock.shortcuts.map((shortcut) => (
              <HomeShortcutCard key={shortcut.id} shortcut={shortcut} />
            ))}
          </View>
        </ScrollView>

        <HomeBottomNav />

        <MedicalGuidanceModal onClose={() => setMedicalGuidanceVisible(false)} visible={medicalGuidanceVisible} />
      </View>
    </SafeAreaView>
  );
}
