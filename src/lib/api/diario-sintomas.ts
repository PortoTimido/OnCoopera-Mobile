import { File } from "expo-file-system";
import { Platform } from "react-native";

import { apiRequest, buildApiUrl } from "@/lib/api/client";

export type Humor = "MUITO_BEM" | "BEM" | "NEUTRO" | "MAL" | "MUITO_MAL";

export type SintomaTipo =
  | "NAUSEA"
  | "FATIGA"
  | "DOR"
  | "TONTURA"
  | "FEBRE"
  | "SONO"
  | "APETITE"
  | "OUTRO";

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
  size?: number;
  type: string;
  uri: string;
};

export type SaveRegistroDiarioPayload = {
  humor: Humor;
  notaVoz?: VoiceNoteFile | null;
  removerNotaVoz?: boolean;
  sintomas: SintomaDiario[];
};

const VOICE_NOTE_MIME_TYPES: Record<string, string> = {
  "3gp": "audio/3gpp",
  caf: "audio/x-caf",
  m4a: "audio/mp4",
  mp3: "audio/mpeg",
  mp4: "audio/mp4",
  ogg: "audio/ogg",
  opus: "audio/ogg",
  wav: "audio/wav",
  webm: "audio/webm",
};

/**
 * Keeps the multipart metadata aligned with the format actually produced by
 * the recorder. In particular, browsers record WebM while iOS and Android's
 * high-quality preset records M4A.
 */
export function createVoiceNoteFile(uri: string, size?: number): VoiceNoteFile {
  const path = uri.split(/[?#]/, 1)[0] ?? "";
  const extension = path.includes(".")
    ? path.split(".").pop()?.toLowerCase()
    : undefined;
  const normalizedExtension =
    extension && VOICE_NOTE_MIME_TYPES[extension] ? extension : "m4a";

  return {
    name: `nota-voz.${normalizedExtension}`,
    ...(size === undefined ? {} : { size }),
    type: VOICE_NOTE_MIME_TYPES[normalizedExtension],
    uri,
  };
}

async function buildRegistroDiarioFormData(payload: SaveRegistroDiarioPayload) {
  const formData = new FormData();

  formData.append("humor", payload.humor);
  formData.append("sintomas", JSON.stringify(payload.sintomas));

  if (payload.notaVoz) {
    if (Platform.OS === "web") {
      const response = await fetch(payload.notaVoz.uri);
      if (!response.ok) {
        throw new Error("Não foi possível ler a nota de voz para envio.");
      }
      formData.append("notaVoz", await response.blob(), payload.notaVoz.name);
    } else {
      // Expo Fetch serializes Blob/File parts, not React Native's legacy { uri, name, type } object.
      const file = new File(payload.notaVoz.uri);
      formData.append("notaVoz", file as unknown as Blob);
    }
  }

  if (payload.removerNotaVoz) {
    formData.append("removerNotaVoz", "true");
  }

  return formData;
}

export function listRegistrosDiarios(
  params: ListRegistrosDiariosParams = {},
  accessToken: string,
) {
  const query = new URLSearchParams();

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 20));

  return apiRequest<PaginatedRegistrosDiarios>(
    `/v1/mobile/diario-sintomas?${query.toString()}`,
    {
      method: "GET",
      token: accessToken,
    },
  );
}

export function getRegistroDiarioHoje(accessToken: string) {
  return apiRequest<RegistroDiario>("/v1/mobile/diario-sintomas/hoje", {
    method: "GET",
    token: accessToken,
  });
}

export async function saveRegistroDiarioHoje(
  payload: SaveRegistroDiarioPayload,
  accessToken: string,
) {
  return apiRequest<RegistroDiario>("/v1/mobile/diario-sintomas/hoje", {
    body: await buildRegistroDiarioFormData(payload),
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

export async function updateRegistroDiario(
  id: string,
  payload: SaveRegistroDiarioPayload,
  accessToken: string,
) {
  return apiRequest<RegistroDiario>(`/v1/mobile/diario-sintomas/${id}`, {
    body: await buildRegistroDiarioFormData(payload),
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
