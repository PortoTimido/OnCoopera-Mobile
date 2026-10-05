import { apiRequest } from "@/lib/api/client";

export type ApoioTipo = "ONG" | "CLINICA" | "TRANSPORTE" | "CASA_APOIO" | "PSICOLOGO";

export type ApoioEndereco = {
  bairro: string;
  cep: string;
  cidade: string;
  complemento: string | null;
  estado: string;
  latitude: number;
  logradouro: string;
  longitude: number;
  numero: string;
};

export type ApoioHorario = {
  diaSemana: number;
  horarioFim: string;
  horarioInicio: string;
};

export type Apoio = {
  dataAtualizacao: string;
  dataCriacao: string;
  descricao: string;
  distanciaKm?: number;
  endereco: ApoioEndereco;
  estaAbertoAgora: boolean;
  horarios: ApoioHorario[];
  id: string;
  imagensUrl: string[];
  nome: string;
  status: "RASCUNHO" | "ATIVO" | "DESATIVADO";
  telefone: string;
  tipoApoio: ApoioTipo;
};

export type PaginatedApoios = {
  data: Apoio[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ListApoiosParams = {
  cidade?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  tipoApoio?: ApoioTipo;
};

export type NearbyGooglePlace = {
  address: string;
  category: string;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
};

export type NearbyGooglePlacesParams = {
  latitude: number;
  longitude: number;
};

export type NearbyGooglePlacesResponse = {
  data: NearbyGooglePlace[];
};

export function buildApoiosQuery(params: ListApoiosParams = {}) {
  const query = new URLSearchParams();

  if (params.cidade?.trim()) query.set("cidade", params.cidade.trim());
  if (typeof params.latitude === "number") query.set("latitude", String(params.latitude));
  if (typeof params.longitude === "number") query.set("longitude", String(params.longitude));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.tipoApoio) query.set("tipoApoio", params.tipoApoio);

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return query.toString();
}

export function listApoios(params: ListApoiosParams = {}) {
  return apiRequest<PaginatedApoios>(`/mobile/apoios?${buildApoiosQuery(params)}`);
}

export function getApoioById(id: string) {
  return apiRequest<Apoio>(`/mobile/apoios/${id}`);
}

export function listNearbyGooglePlaces(params: NearbyGooglePlacesParams, accessToken: string) {
  return apiRequest<NearbyGooglePlacesResponse>("/mobile/apoios/places/nearby", {
    body: params,
    method: "POST",
    token: accessToken,
  });
}
