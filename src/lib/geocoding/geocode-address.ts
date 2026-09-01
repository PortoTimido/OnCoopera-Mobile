export type GeocodeAddressResult = {
  latitude: number;
  longitude: number;
};

export function getPendingGeocodingCoordinates(): GeocodeAddressResult {
  return {
    latitude: 0,
    longitude: 0,
  };
}
