import { useState } from "react";
import { Switch, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { nativePropColors } from "@/lib/design/native-prop-colors";

export function SettingsNotificationsCard() {
  const [importantAlertsEnabled, setImportantAlertsEnabled] = useState(true);

  return (
    <View className="gap-4 rounded-home-card bg-home-surface p-5 shadow-home-clay">
      <AppText className="text-[16px] leading-[22px] text-home-ink" variant="subtitle">
        Notificacoes
      </AppText>

      <View className="flex-row items-center justify-between rounded-2xl bg-home-canvas px-4 py-3">
        <Text className="font-sans-medium text-[14px] leading-[20px] text-home-ink">Alertas importantes</Text>
        <Switch
          accessibilityLabel="Alertas importantes"
          onValueChange={setImportantAlertsEnabled}
          testID="settings-important-alerts"
          thumbColor={nativePropColors.white}
          trackColor={{ false: "#d7d3c8", true: nativePropColors.brandMint }}
          value={importantAlertsEnabled}
        />
      </View>
    </View>
  );
}
