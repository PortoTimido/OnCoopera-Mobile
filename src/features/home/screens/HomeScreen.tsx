import { ArrowRight, CalendarDays, Clock3, FileText, PenLine } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { HomeBottomNav, HomeShortcutCard, HomeTopBar } from "@/features/home/components";
import { homeMock } from "@/features/home/home.mock";
import { useHomeClock } from "@/features/home/hooks/use-home-clock";
import { useHomeUser } from "@/features/home/hooks/use-home-user";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function HomeScreen() {
  const { dateTimeLabel, greeting } = useHomeClock();
  const { displayName, initials } = useHomeUser();

  return (
    <SafeAreaView style={{ backgroundColor: nativePropColors.homeCanvas, flex: 1 }}>
      <View className="relative flex-1 bg-home-canvas" testID="home-screen">
        <HomeTopBar dateTimeLabel={dateTimeLabel} initials={initials} />

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
              Como voce esta se sentindo neste momento?
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-8">
            {homeMock.shortcuts.map((shortcut) => (
              <HomeShortcutCard key={shortcut.id} shortcut={shortcut} />
            ))}
          </View>

          <View className="rounded-home-card bg-home-purple px-8 py-9 shadow-home-clay">
            <View className="max-w-[240px] gap-4">
              <AppText className="text-[24px] leading-[31px] text-white" variant="title">
                {homeMock.prompt.title}
              </AppText>
              <Text className="font-sans text-[14px] leading-[20px] text-white/85">{homeMock.prompt.body}</Text>
              <Pressable
                accessibilityLabel={homeMock.prompt.cta}
                accessibilityRole="button"
                accessibilityState={{ disabled: true }}
                className="min-h-11 flex-row items-center justify-center gap-2 self-start rounded-pill bg-home-purple-soft px-6 shadow-home-soft"
                disabled
                testID="home-symptoms-cta"
              >
                <PenLine color={nativePropColors.homeLavenderInk} size={14} strokeWidth={2.2} />
                <Text className="font-sans-bold text-[14px] leading-[20px] text-home-lavender-ink">
                  {homeMock.prompt.cta}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="flex-row items-center gap-4 rounded-home-card border-2 border-home-appointment-border bg-home-blue-soft p-6 shadow-home-clay">
            <View className="size-12 items-center justify-center rounded-2xl bg-home-blue">
              <CalendarDays color={nativePropColors.white} size={22} strokeWidth={2.2} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-sans-bold text-[10px] leading-[14px] text-home-blue-ink/60">
                {homeMock.appointment.label}
              </Text>
              <AppText className="text-[18px] leading-[24px] text-home-blue-ink" variant="subtitle">
                {homeMock.appointment.doctor}
              </AppText>
              <View className="flex-row items-center gap-4 pt-1">
                <View className="flex-row items-center gap-1">
                  <CalendarDays color={nativePropColors.homeBlueInk} size={12} strokeWidth={2.2} />
                  <Text className="font-sans text-[12px] leading-[16px] text-home-blue-ink">
                    {homeMock.appointment.day}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Clock3 color={nativePropColors.homeBlueInk} size={12} strokeWidth={2.2} />
                  <Text className="font-sans text-[12px] leading-[16px] text-home-blue-ink">
                    {homeMock.appointment.time}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Pressable
            accessibilityLabel={homeMock.reportCta}
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            className="min-h-[86px] flex-row items-center justify-between rounded-home-card bg-home-green px-7 shadow-home-clay"
            disabled
            testID="home-report-cta"
          >
            <View className="flex-row items-center gap-4">
              <View className="size-10 items-center justify-center rounded-pill bg-white/15">
                <FileText color={nativePropColors.white} size={22} strokeWidth={2.1} />
              </View>
              <Text className="font-sans-bold text-[14px] leading-[20px] text-white">{homeMock.reportCta}</Text>
            </View>
            <ArrowRight color={nativePropColors.white} size={24} strokeWidth={2.2} />
          </Pressable>
        </ScrollView>

        <HomeBottomNav />
      </View>
    </SafeAreaView>
  );
}
