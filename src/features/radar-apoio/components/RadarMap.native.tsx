import { router } from "expo-router";
import { Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE, type Region } from "react-native-maps";
import { View as CssView } from "react-native-css/components";

import { formatApoioAddress } from "@/features/radar-apoio/radar-apoio-formatters";
import { nativePropColors } from "@/lib/design/native-prop-colors";
import type { RadarMapProps } from "../radar-map-types";

function regionFor({ latitude, longitude }: RadarMapProps["location"]): Region {
  return { latitude, longitude, latitudeDelta: 0.18, longitudeDelta: 0.18 };
}

export function RadarMap({ apoios, location, showUserLocation = false }: RadarMapProps) {
  return <CssView accessibilityLabel="Mapa de apoios próximos" className="h-[250px] overflow-hidden rounded-home-card border-2 border-radar-info-border">
    <MapView initialRegion={regionFor(location)} provider={PROVIDER_GOOGLE} showsMyLocationButton={showUserLocation} showsUserLocation={showUserLocation} style={{ flex: 1 }}>
      {apoios.map((apoio) => {
        const { latitude, longitude } = apoio.endereco;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) return null;
        const address = formatApoioAddress(apoio);
        return <Marker coordinate={{ latitude, longitude }} key={apoio.id} pinColor={nativePropColors.brandPrimary}><Callout onPress={() => router.push(`/apoios/${apoio.id}`)}><View style={{ maxWidth: 220, padding: 8 }}><Text style={{ color: nativePropColors.authInk, fontWeight: "700" }}>{apoio.nome}</Text><Text style={{ color: nativePropColors.homeMuted }}>{`${address.lineOne}, ${address.lineTwo}`}</Text><Text style={{ color: nativePropColors.brandPrimary, fontWeight: "700", marginTop: 6 }}>Ver detalhes</Text></View></Callout></Marker>;
      })}
    </MapView>
  </CssView>;
}
