import type { RadarMapProps } from "../radar-map-types";
import { RadarStaticMap } from "./RadarStaticMap";

export function RadarMap({ apoios }: RadarMapProps) {
  return <RadarStaticMap apoios={apoios} />;
}
