import type { Apoio } from "@/lib/api/apoios";

export type RadarMapMarker = {
  id: string;
  left: number;
  top: number;
};

const FALLBACK_POSITIONS = [
  [24, 35],
  [64, 24],
  [48, 58],
  [76, 64],
  [31, 72],
] as const;

export function getRadarMapMarkers(apoios: Apoio[]): RadarMapMarker[] {
  const validCoordinates = apoios.filter(
    (apoio) => Number.isFinite(apoio.endereco.latitude) && Number.isFinite(apoio.endereco.longitude),
  );
  const latitudes = validCoordinates.map((apoio) => apoio.endereco.latitude);
  const longitudes = validCoordinates.map((apoio) => apoio.endereco.longitude);
  const latitudeRange = Math.max(...latitudes) - Math.min(...latitudes);
  const longitudeRange = Math.max(...longitudes) - Math.min(...longitudes);

  return apoios.map((apoio, index) => {
    const fallback = FALLBACK_POSITIONS[index % FALLBACK_POSITIONS.length];
    const hasPosition = validCoordinates.includes(apoio) && latitudeRange > 0 && longitudeRange > 0;
    const left = hasPosition ? 12 + ((apoio.endereco.longitude - Math.min(...longitudes)) / longitudeRange) * 76 : fallback[0];
    const top = hasPosition ? 14 + ((Math.max(...latitudes) - apoio.endereco.latitude) / latitudeRange) * 68 : fallback[1];

    return { id: apoio.id, left: Math.round((left / 100) * 300), top: Math.round((top / 100) * 160) };
  });
}
