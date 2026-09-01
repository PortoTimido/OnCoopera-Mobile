import { getPendingGeocodingCoordinates } from "@/lib/geocoding/geocode-address";

describe("getPendingGeocodingCoordinates", () => {
  it("returns zero coordinates until Google Maps integration is implemented", () => {
    expect(getPendingGeocodingCoordinates()).toEqual({
      latitude: 0,
      longitude: 0,
    });
  });
});
