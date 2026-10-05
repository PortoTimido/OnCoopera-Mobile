import type { Apoio } from "@/lib/api/apoios";

export type RadarCoordinates = {
  latitude: number;
  longitude: number;
};

export type RadarMapProps = {
  apoios: Apoio[];
  location: RadarCoordinates;
  showUserLocation?: boolean;
};

export function isValidRadarCoordinates(coordinates: RadarCoordinates | null | undefined) {
  if (!coordinates) return false;

  const { latitude, longitude } = coordinates;
  return Number.isFinite(latitude) && Number.isFinite(longitude) && !(latitude === 0 && longitude === 0);
}
