export type GeocodeAddressInput = {
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  logradouro: string;
  numero: string;
};

export type GeocodeAddressResult = {
  latitude: number;
  longitude: number;
};

export class GeocodingPendingError extends Error {
  constructor() {
    super("A integracao com Google Geocoding ainda nao esta configurada para concluir o cadastro.");
    this.name = "GeocodingPendingError";
  }
}

function formatAddress(input: GeocodeAddressInput) {
  return [
    `${input.logradouro}, ${input.numero}`,
    input.bairro,
    input.cidade,
    input.estado,
    input.cep,
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");
}

export async function geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeAddressResult> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GEOCODING_API_KEY;

  if (!apiKey) {
    throw new GeocodingPendingError();
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formatAddress(input))}&key=${apiKey}`,
  );
  const data = (await response.json()) as {
    results?: Array<{ geometry?: { location?: { lat?: number; lng?: number } } }>;
    status?: string;
  };
  const location = data.results?.[0]?.geometry?.location;

  if (!response.ok || data.status !== "OK" || typeof location?.lat !== "number" || typeof location.lng !== "number") {
    throw new Error("Nao foi possivel localizar o endereco informado.");
  }

  return {
    latitude: location.lat,
    longitude: location.lng,
  };
}
