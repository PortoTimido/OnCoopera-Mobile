import { router, useLocalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { Clock3, Map, MapPin, Phone } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Alert, BackHandler, Modal, Platform, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { ScrollView, Text, View } from "react-native-css/components";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui";
import { getApoioById, type Apoio } from "@/lib/api/apoios";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { APOIO_TIPO_LABEL, formatApoioAddress, formatApoioSchedule } from "../radar-apoio-formatters";

const OVERLAY_OPACITY = 0.6;
const CLOSE_DISTANCE_RATIO = 0.25;
const CLOSE_VELOCITY = 1_000;
type Coordinates = { latitude: number; longitude: number };

function directionsUrl(app: "google" | "waze" | "apple", origin: Coordinates, destination: Coordinates) {
  const from = `${origin.latitude},${origin.longitude}`;
  const to = `${destination.latitude},${destination.longitude}`;

  if (app === "waze") return `waze://?ll=${encodeURIComponent(to)}&navigate=yes`;
  if (app === "apple") return `http://maps.apple.com/?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}`;
  if (Platform.OS === "ios") return `comgooglemaps://?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}&directionsmode=driving`;
  return `google.navigation:q=${encodeURIComponent(to)}`;
}

function DetailInformation({ children, icon, title }: { children: string; icon: ReactNode; title: string }) {
  return (
    <View className="gap-3 rounded-home-card border-2 border-radar-info-border bg-radar-info px-6 py-5">
      <View className="flex-row items-center gap-2">
        {icon}
        <Text className="font-sans-bold text-[14px] text-brand-primary">{title}</Text>
      </View>
      <Text className="font-sans text-[15px] leading-[24px] text-home-muted">{children}</Text>
    </View>
  );
}

function DetailSkeleton() {
  return (
    <View className="gap-6" testID="radar-apoio-detail-skeleton">
      <View className="items-center gap-3 pt-2">
        <View className="h-10 w-[235px] rounded-pill bg-radar-info" />
        <View className="h-8 w-24 rounded-pill bg-radar-info" />
      </View>
      {["address", "phone", "schedule"].map((item) => (
        <View className="gap-3 rounded-home-card border-2 border-radar-info-border bg-radar-info px-6 py-5" key={item}>
          <View className="h-5 w-28 rounded-pill bg-radar-info-border" />
          <View className="h-5 w-full rounded-pill bg-radar-info-border" />
          {item === "address" ? <View className="h-5 w-[70%] rounded-pill bg-radar-info-border" /> : null}
        </View>
      ))}
      <View className="h-[52px] rounded-pill bg-radar-info" />
    </View>
  );
}

export function RadarApoioDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [apoio, setApoio] = useState<Apoio | null>(null);
  const [error, setError] = useState(false);
  const [origin, setOrigin] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showMapChoices, setShowMapChoices] = useState(false);
  const isClosing = useRef(false);
  const sheetTranslateY = useSharedValue(height);
  const overlayOpacity = useSharedValue(0);

  const close = useCallback(() => {
    if (isClosing.current) return;

    isClosing.current = true;
    overlayOpacity.value = withTiming(0, { duration: 180 });
    sheetTranslateY.value = withTiming(height, { duration: 220 }, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  }, [height, overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    overlayOpacity.value = withTiming(OVERLAY_OPACITY, { duration: 220 });
    sheetTranslateY.value = withTiming(0, { duration: 280 });
  }, [overlayOpacity, sheetTranslateY]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      close();
      return true;
    });

    return () => subscription.remove();
  }, [close]);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      setError(true);
      return undefined;
    }

    getApoioById(id)
      .then((result) => {
        if (mounted) setApoio(result);
      })
      .catch(() => {
        if (mounted) setError(true);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: sheetTranslateY.value }] }));
  const panGesture = Gesture.Pan()
    .activeOffsetY([10, 9999])
    .onUpdate((event) => {
      sheetTranslateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > height * CLOSE_DISTANCE_RATIO || event.velocityY > CLOSE_VELOCITY) {
        runOnJS(close)();
        return;
      }

      sheetTranslateY.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  const address = apoio ? formatApoioAddress(apoio) : null;

  const chooseMap = useCallback(async () => {
    if (isLocating || !apoio) return;
    setIsLocating(true);
    try {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      const permission = currentPermission.granted ? currentPermission : await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Localização necessária", "Permita o acesso à localização para criar uma rota a partir de onde você está.");
        return;
      }

      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) throw new Error("Invalid location");
      setOrigin({ latitude, longitude });
      setShowMapChoices(true);
    } catch {
      Alert.alert("Localização indisponível", "Não foi possível obter sua localização atual. Tente novamente.");
    } finally {
      setIsLocating(false);
    }
  }, [apoio, isLocating]);

  const openDirections = useCallback(async (app: "google" | "waze" | "apple") => {
    if (!apoio || !origin) return;
    setShowMapChoices(false);
    const destination = apoio.endereco;
    if (!Number.isFinite(destination.latitude) || !Number.isFinite(destination.longitude)) {
      Alert.alert("Destino indisponível", "Este apoio não possui coordenadas válidas para criar uma rota.");
      return;
    }
    try {
      await Linking.openURL(directionsUrl(app, origin, destination));
    } catch {
      Alert.alert("Não foi possível abrir o mapa", "Verifique se o aplicativo escolhido está instalado e tente novamente.");
    }
  }, [apoio, origin]);

  return (
    <View style={styles.root} testID="radar-apoio-detail-screen">
      <Animated.View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
      <Pressable
        accessibilityLabel="Fechar detalhes do apoio"
        accessibilityRole="button"
        onPress={close}
        style={StyleSheet.absoluteFill}
        testID="radar-apoio-detail-backdrop"
      />
      <Animated.View style={[styles.sheet, { maxHeight: height * 0.88, paddingBottom: Math.max(insets.bottom, 32) }, sheetStyle]}>
        <GestureDetector gesture={panGesture}>
          <View className="items-center px-8 pb-5 pt-4" testID="radar-apoio-detail-drag-handle">
            <View className="h-1.5 w-10 rounded-pill bg-radar-info-border" />
          </View>
        </GestureDetector>
        <ScrollView contentContainerClassName="gap-6 px-8 pb-2" showsVerticalScrollIndicator={false}>
          {!apoio && !error ? <DetailSkeleton /> : null}
          {apoio && address ? (
            <>
              <View className="items-center gap-3 pt-2">
                <AppText className="text-center text-[32px] leading-[39px] text-brand-primary" variant="title">{apoio.nome}</AppText>
                <View className="rounded-pill bg-home-lavender px-5 py-2">
                  <Text className="font-sans-bold text-[12px] tracking-wide text-home-lavender-ink">{APOIO_TIPO_LABEL[apoio.tipoApoio].toLocaleUpperCase("pt-BR")}</Text>
                </View>
              </View>
              <DetailInformation icon={<MapPin color={nativePropColors.brandPrimary} size={18} strokeWidth={2.6} />} title="Endereço">{`${address.lineOne}\n${address.lineTwo}`}</DetailInformation>
              <DetailInformation icon={<Phone color={nativePropColors.brandPrimary} size={18} strokeWidth={2.6} />} title="Telefone">{apoio.telefone}</DetailInformation>
              <DetailInformation icon={<Clock3 color={nativePropColors.homeLavenderInk} size={18} strokeWidth={2.4} />} title="Horário">{formatApoioSchedule(apoio.horarios)}</DetailInformation>
              <Pressable accessibilityLabel="Como chegar" accessibilityRole="button" accessibilityState={{ disabled: isLocating }} className="min-h-[52px] flex-row items-center justify-center gap-3 rounded-pill bg-brand-mint px-6" disabled={isLocating} onPress={() => void chooseMap()} testID="radar-directions-button">
                <Map color={nativePropColors.brandPrimary} size={22} strokeWidth={2.5} />
                <Text className="font-sans-bold text-[16px] text-brand-primary">{isLocating ? "Obtendo localização..." : "Como chegar"}</Text>
              </Pressable>
            </>
          ) : null}
          {error ? (
            <View className="items-center gap-3 py-10" testID="radar-apoio-detail-error">
              <AppText className="text-center text-feedback-danger" variant="body">Não foi possível carregar este apoio.</AppText>
            </View>
          ) : null}
        </ScrollView>
      </Animated.View>
      <Modal animationType="fade" onRequestClose={() => setShowMapChoices(false)} transparent visible={showMapChoices}>
        <View style={styles.choiceBackdrop}>
          <View className="w-full gap-3 rounded-home-card bg-white p-6" testID="radar-map-choices">
            <AppText className="text-center text-brand-primary" variant="title">Abrir rota em</AppText>
            <Pressable accessibilityRole="button" className="rounded-pill bg-brand-mint p-4" onPress={() => void openDirections("google")} testID="radar-map-google">
              <Text className="text-center font-sans-bold text-brand-primary">Google Maps</Text>
            </Pressable>
            <Pressable accessibilityRole="button" className="rounded-pill bg-brand-mint p-4" onPress={() => void openDirections("waze")} testID="radar-map-waze">
              <Text className="text-center font-sans-bold text-brand-primary">Waze</Text>
            </Pressable>
            {Platform.OS === "ios" ? <Pressable accessibilityRole="button" className="rounded-pill bg-brand-mint p-4" onPress={() => void openDirections("apple")} testID="radar-map-apple">
              <Text className="text-center font-sans-bold text-brand-primary">Apple Maps</Text>
            </Pressable> : null}
            <Pressable accessibilityRole="button" className="p-3" onPress={() => setShowMapChoices(false)}>
              <Text className="text-center font-sans-bold text-brand-primary">Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  choiceBackdrop: { ...StyleSheet.absoluteFill, alignItems: "center", backgroundColor: "#00000099", justifyContent: "center", padding: 24 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "#000000" },
  root: { ...StyleSheet.absoluteFill, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: nativePropColors.white,
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
  },
});
