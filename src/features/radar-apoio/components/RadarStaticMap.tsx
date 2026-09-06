import { MapPin } from "lucide-react-native";
import { View } from "react-native-css/components";

import type { Apoio } from "@/lib/api/apoios";
import { nativePropColors } from "@/lib/design/native-prop-colors";

import { getRadarMapMarkers } from "../radar-map-markers";

type RadarStaticMapProps = {
  apoios: Apoio[];
};

export function RadarStaticMap({ apoios }: RadarStaticMapProps) {
  const markers = getRadarMapMarkers(apoios);

  return (
    <View accessibilityLabel="Prévia estática do mapa de apoios" className="h-[190px] overflow-hidden rounded-home-card border-2 border-radar-info-border bg-radar-map">
      <View className="absolute -left-6 top-11 h-8 w-[130%] rotate-[-18deg] bg-radar-map-line/80" />
      <View className="absolute -left-6 top-28 h-6 w-[130%] rotate-[14deg] bg-radar-map-line/80" />
      <View className="absolute left-[18%] top-0 h-[120%] w-5 rotate-[28deg] bg-radar-map-line/80" />
      <View className="absolute left-[70%] top-0 h-[120%] w-4 rotate-[-22deg] bg-radar-map-line/80" />
      {markers.map((marker) => (
        <View className="absolute -ml-3 -mt-6" key={marker.id} style={{ left: marker.left, top: marker.top }}>
          <MapPin color={nativePropColors.brandPrimary} fill={nativePropColors.brandMint} size={25} strokeWidth={2.4} />
        </View>
      ))}
    </View>
  );
}
