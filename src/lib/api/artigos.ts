import { apiRequest } from "@/lib/api/client";

export type ArtigoTaxonomia = {
  id: string;
  nome: string;
};

export type ArtigoStatus = "RASCUNHO" | "PUBLICADO" | "DESATIVADO";

export type Artigo = {
  autorId: string;
  categorias: ArtigoTaxonomia[];
  conteudo: string;
  dataAtualizacao: string;
  dataCriacao: string;
  dataPublicacao: string | null;
  id: string;
  imagemUrl: string | null;
  status: ArtigoStatus;
  tags: ArtigoTaxonomia[];
  tempoLeituraMinutos: number;
  titulo: string;
};

export type PaginatedArtigos = {
  data: Artigo[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ListArtigosParams = {
  categoriaId?: string;
  page?: number;
  pageSize?: number;
  search?: string;
  tagId?: string;
};

function buildListQuery(params: ListArtigosParams) {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.categoriaId) {
    query.set("categoriaId", params.categoriaId);
  }

  if (params.tagId) {
    query.set("tagId", params.tagId);
  }

  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 100));

  return query.toString();
}

export function listArtigos(params: ListArtigosParams = {}) {
  return apiRequest<PaginatedArtigos>(`/mobile/artigos?${buildListQuery(params)}`);
}

export function getArtigoById(id: string) {
  return apiRequest<Artigo>(`/mobile/artigos/${id}`);
}
