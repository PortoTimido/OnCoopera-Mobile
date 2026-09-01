import { geocodeAddress, GeocodingPendingError } from "@/lib/geocoding/geocode-address";

describe("geocodeAddress", () => {
  const input = {
    bairro: "Centro",
    cep: "01001000",
    cidade: "Sao Paulo",
    estado: "SP",
    logradouro: "Praca da Se",
    numero: "1",
  };

  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY;
    globalThis.fetch = jest.fn();
  });

  it("blocks registration coordinates when Google Geocoding is not configured", async () => {
    await expect(geocodeAddress(input)).rejects.toBeInstanceOf(GeocodingPendingError);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns coordinates from Google Geocoding when configured", async () => {
    process.env.EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY = "google-key";
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        results: [{ geometry: { location: { lat: -23.5505, lng: -46.6333 } } }],
        status: "OK",
      }),
      ok: true,
    });

    await expect(geocodeAddress(input)).resolves.toEqual({
      latitude: -23.5505,
      longitude: -46.6333,
    });
    expect(globalThis.fetch).toHaveBeenCalledWith(expect.stringContaining("maps.googleapis.com/maps/api/geocode/json"));
  });
});
