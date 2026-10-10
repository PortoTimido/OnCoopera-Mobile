import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { View as CssView } from "react-native-css/components";

import { formatApoioAddress } from "@/features/radar-apoio/radar-apoio-formatters";
import { nativePropColors } from "@/lib/design/native-prop-colors";
import type { RadarMapProps } from "../radar-map-types";

function regionFor({ latitude, longitude }: RadarMapProps["location"]): Region {
  return { latitude, longitude, latitudeDelta: 0.18, longitudeDelta: 0.18 };
}

export function RadarMap({ apoios, location, showUserLocation = false }: RadarMapProps) {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const markerCoordinates = useMemo(
    () => apoios.flatMap((apoio) => {
      const { latitude, longitude } = apoio.endereco;
      return Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0)
        ? [{ latitude, longitude }]
        : [];
    }),
    [apoios],
  );

  const focusMarkers = useCallback(() => {
    if (!isMapReady) return;

    if (markerCoordinates.length > 0) {
      mapRef.current?.fitToCoordinates([location, ...markerCoordinates], {
        animated: false,
        edgePadding: { bottom: 8, left: 8, right: 8, top: 8 },
      });
      return;
    }

    mapRef.current?.animateToRegion(regionFor(location), 0);
  }, [isMapReady, location, markerCoordinates]);

  useEffect(() => {
    focusMarkers();
  }, [focusMarkers]);

  return <CssView accessibilityLabel="Mapa de apoios próximos" className="h-[228px] overflow-hidden rounded-home-card border-2 border-radar-info-border">
    <MapView
      initialRegion={regionFor(location)}
      onMapReady={() => setIsMapReady(true)}
      provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      ref={mapRef}
      showsMyLocationButton={showUserLocation}
      showsUserLocation={showUserLocation}
      style={{ flex: 1 }}
    >
      {apoios.map((apoio) => {
        const { latitude, longitude } = apoio.endereco;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) return null;
        const address = formatApoioAddress(apoio);
        return <Marker coordinate={{ latitude, longitude }} key={apoio.id} pinColor={nativePropColors.brandPrimary}><Callout onPress={() => router.push(`/apoios/${apoio.id}`)}><View style={{ maxWidth: 220, padding: 8 }}><Text style={{ color: nativePropColors.authInk, fontWeight: "700" }}>{apoio.nome}</Text><Text style={{ color: nativePropColors.homeMuted }}>{`${address.lineOne}, ${address.lineTwo}`}</Text><Text style={{ color: nativePropColors.brandPrimary, fontWeight: "700", marginTop: 6 }}>Ver detalhes</Text></View></Callout></Marker>;
      })}
    </MapView>
  </CssView>;
}
