import { CalendarDays } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, type ScrollView as RNScrollView } from "react-native";
import { Pressable, ScrollView, Text, View } from "react-native-css/components";

import { AppText } from "@/components/ui";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { formatDateBR } from "@/features/auth/masks";
import { cn } from "@/lib/cn";
import { nativePropColors } from "@/lib/design/native-prop-colors";

type BirthDatePickerProps = {
  error?: string;
  label: string;
  onChange: (isoDate: string) => void;
  testID?: string;
  value: string;
};

const ITEM_HEIGHT = 44;
const VISIBLE_ROWS = 5;
const PADDING = Math.floor(VISIBLE_ROWS / 2) * ITEM_HEIGHT;

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 111 }, (_, index) => currentYear - index);

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    const fallbackYear = currentYear - 18;
    return { day: 1, month: 1, year: fallbackYear };
  }

  return { day, month, year };
}

type WheelColumnProps = {
  items: number[];
  onSelect: (value: number) => void;
  renderLabel?: (value: number) => string;
  selected: number;
};

function WheelColumn({ items, onSelect, renderLabel, selected }: WheelColumnProps) {
  const scrollRef = useRef<RNScrollView>(null);
  const initialIndex = Math.max(items.indexOf(selected), 0);

  function scrollToValue(value: number, animated: boolean) {
    const index = Math.max(items.indexOf(value), 0);
    scrollRef.current?.scrollTo({ animated, y: index * ITEM_HEIGHT });
  }

  useEffect(() => {
    scrollToValue(selected, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  function commitFromOffset(offsetY: number) {
    const index = Math.min(Math.max(Math.round(offsetY / ITEM_HEIGHT), 0), items.length - 1);
    const value = items[index];

    if (value !== undefined && value !== selected) {
      onSelect(value);
    }
  }

  function handlePressItem(value: number) {
    if (value !== selected) {
      onSelect(value);
    }

    scrollToValue(value, true);
  }

  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ paddingVertical: PADDING }}
      contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
      decelerationRate="fast"
      onMomentumScrollEnd={(event) => commitFromOffset(event.nativeEvent.contentOffset.y)}
      onScrollEndDrag={(event) => commitFromOffset(event.nativeEvent.contentOffset.y)}
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
    >
      {items.map((item) => (
        <Pressable
          className="items-center justify-center"
          key={item}
          onPress={() => handlePressItem(item)}
          style={{ height: ITEM_HEIGHT }}
        >
          <Text
            className={cn(
              "font-sans text-[16px] text-auth-muted",
              item === selected && "font-sans-bold text-[18px] text-auth-ink",
            )}
          >
            {renderLabel ? renderLabel(item) : pad(item)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function BirthDatePicker({ error, label, onChange, testID, value }: BirthDatePickerProps) {
  const [visible, setVisible] = useState(false);
  const parsed = useMemo(() => parseIsoDate(value), [value]);
  const [draftDay, setDraftDay] = useState(parsed.day);
  const [draftMonth, setDraftMonth] = useState(parsed.month);
  const [draftYear, setDraftYear] = useState(parsed.year);

  const maxDay = daysInMonth(draftMonth, draftYear);
  const days = useMemo(() => Array.from({ length: maxDay }, (_, index) => index + 1), [maxDay]);
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => index + 1), []);

  function openPicker() {
    const current = parseIsoDate(value);
    setDraftDay(current.day);
    setDraftMonth(current.month);
    setDraftYear(current.year);
    setVisible(true);
  }

  function handleConfirm() {
    const safeDay = Math.min(draftDay, daysInMonth(draftMonth, draftYear));
    onChange(`${draftYear}-${pad(draftMonth)}-${pad(safeDay)}`);
    setVisible(false);
  }

  return (
    <View className="gap-2">
      <AppText className="font-sans-semibold text-[12px] uppercase text-auth-muted" variant="caption">
        {label}
      </AppText>

      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className={cn(
          "min-h-14 flex-row items-center gap-3 rounded-pill border bg-auth-field px-4",
          error && "border-feedback-danger bg-feedback-danger-soft",
        )}
        onPress={openPicker}
        testID={testID}
      >
        <CalendarDays color={error ? nativePropColors.danger : nativePropColors.authMuted} size={20} strokeWidth={2} />
        <Text className={cn("font-sans text-[15px] leading-[20px]", value ? "text-auth-ink" : "text-auth-placeholder")}>
          {value ? formatDateBR(value) : "DD/MM/AAAA"}
        </Text>
      </Pressable>

      {error ? (
        <AppText className="text-feedback-danger" variant="caption">
          {error}
        </AppText>
      ) : null}

      <Modal animationType="fade" onRequestClose={() => setVisible(false)} transparent visible={visible}>
        <Pressable
          accessibilityLabel="Fechar"
          accessibilityRole="button"
          className="flex-1 items-center justify-end"
          onPress={() => setVisible(false)}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <Pressable className="w-full gap-5 rounded-t-[32px] bg-auth-card px-6 pb-8 pt-6" onPress={() => undefined}>
            <AppText className="text-center text-auth-ink" variant="subtitle">
              Data de nascimento
            </AppText>

            <View className="flex-row" style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}>
              <View className="flex-1 items-center justify-center">
                <WheelColumn items={days} onSelect={setDraftDay} selected={Math.min(draftDay, maxDay)} />
              </View>
              <View className="flex-[1.6] items-center justify-center">
                <WheelColumn
                  items={months}
                  onSelect={setDraftMonth}
                  renderLabel={(item) => MONTHS[item - 1] ?? pad(item)}
                  selected={draftMonth}
                />
              </View>
              <View className="flex-1 items-center justify-center">
                <WheelColumn items={YEARS} onSelect={setDraftYear} selected={draftYear} />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <AuthButton onPress={() => setVisible(false)} title="Cancelar" variant="secondary" />
              </View>
              <View className="flex-1">
                <AuthButton onPress={handleConfirm} testID={testID ? `${testID}-confirm` : undefined} title="Confirmar" />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
