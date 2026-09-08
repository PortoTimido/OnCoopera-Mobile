import { apiRequest, buildApiUrl } from "@/lib/api/client";

export type Humor = "MUITO_BEM" | "BEM" | "NEUTRO" | "MAL" | "MUITO_MAL";

export type SintomaTipo = "NAUSEA" | "FATIGA" | "DOR" | "TONTURA" | "FEBRE" | "SONO" | "APETITE" | "OUTRO";

export type SintomaDiario = {
  descricaoOutro?: string | null;
  intensidade: number;
  tipo: SintomaTipo;
};

export type RegistroDiario = {
  dataHora: string;
  dataRegistro: string;
  humor: Humor;
  id: string;
  notaVozUrl?: string | null;
  sintomas: SintomaDiario[];
};

export type PaginatedRegistrosDiarios = {
  data: RegistroDiario[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ListRegistrosDiariosParams = {
  page?: number;
  pageSize?: number;
};

export type VoiceNoteFile = {
  name: string;
  type: string;
  uri: string;
};

export type SaveRegistroDiarioPayload = {
  humor: Humor;
  notaVoz?: VoiceNoteFile | null;
  removerNotaVoz?: boolean;
  sintomas: SintomaDiario[];
};

function buildRegistroDiarioFormData(payload: SaveRegistroDiarioPayload) {
  const formData = new FormData();

  formData.append("humor", payload.humor);
  formData.append("sintomas", JSON.stringify(payload.sintomas));

  if (payload.notaVoz) {
    formData.append("notaVoz", {
      name: payload.notaVoz.name,
      type: payload.notaVoz.type,
      uri: payload.notaVoz.uri,
    } as unknown as Blob);
  }

  if (payload.removerNotaVoz) {
    formData.append("removerNotaVoz", "true");
  }

  return formData;
}

export function listRegistrosDiarios(params: ListRegistrosDiariosParams = {}, accessToken: string) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return apiRequest<PaginatedRegistrosDiarios>(`/v1/mobile/diario-sintomas?${query.toString()}`, {
    method: "GET",
    token: accessToken,
  });
}

export function getRegistroDiarioHoje(accessToken: string) {
  return apiRequest<RegistroDiario>("/v1/mobile/diario-sintomas/hoje", {
    method: "GET",
    token: accessToken,
  });
}

export function saveRegistroDiarioHoje(payload: SaveRegistroDiarioPayload, accessToken: string) {
  return apiRequest<RegistroDiario>("/v1/mobile/diario-sintomas/hoje", {
    body: buildRegistroDiarioFormData(payload),
    method: "PUT",
    token: accessToken,
  });
}

export function getRegistroDiarioById(id: string, accessToken: string) {
  return apiRequest<RegistroDiario>(`/v1/mobile/diario-sintomas/${id}`, {
    method: "GET",
    token: accessToken,
  });
}

export function updateRegistroDiario(id: string, payload: SaveRegistroDiarioPayload, accessToken: string) {
  return apiRequest<RegistroDiario>(`/v1/mobile/diario-sintomas/${id}`, {
    body: buildRegistroDiarioFormData(payload),
    method: "PATCH",
    token: accessToken,
  });
}

export function buildNotaVozSource(id: string, accessToken: string) {
  return {
    headers: { Authorization: `Bearer ${accessToken}` },
    uri: buildApiUrl(`/v1/mobile/diario-sintomas/${id}/nota-voz`),
  };
}
