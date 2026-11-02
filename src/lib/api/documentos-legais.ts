import { apiRequest } from "@/lib/api/client";

export type LegalDocumentType = "TERMOS_USO" | "POLITICA_PRIVACIDADE";

export type LegalDocument = {
  atualizadoEm: string;
  conteudo: string;
  id: string;
  tipo: LegalDocumentType;
  versao: string;
};

export function getLegalDocument(tipo: LegalDocumentType) {
  return apiRequest<LegalDocument>(`/mobile/documentos-legais/${tipo}`, { method: "GET" });
}
