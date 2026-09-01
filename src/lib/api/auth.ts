import { apiRequest } from "@/lib/api/client";

export type UserStatus = "ATIVO" | "INATIVO" | "BLOQUEADO";
export type UserType = "USUARIO" | "PACIENTE" | "ADMINISTRADOR";

export type AuthenticatedUser = {
  dataNascimento: string;
  email: string;
  id: string;
  login: string;
  nome: string;
  perfisAdministrativos: string[];
  status: UserStatus;
  telefone: string;
  tipo: UserType;
  trocaSenhaObrigatoria: boolean;
  ultimoAcesso: string | null;
};

export type AuthResponse = {
  accessToken: string;
  usuario: AuthenticatedUser;
};

export type LoginRequest = {
  identificador: string;
  senha: string;
};

export type ChangeTemporaryPasswordRequest = {
  identificador: string;
  novaSenha: string;
  senhaTemporaria: string;
};

export type AddressRequest = {
  bairro: string;
  cep: string;
  cidade: string;
  complemento?: string | null;
  estado: string;
  latitude: number;
  logradouro: string;
  longitude: number;
  numero: string;
};

export type CreatePatientRequest = {
  dataNascimento: string;
  email: string;
  endereco: AddressRequest;
  login: string;
  nome: string;
  senha: string;
  telefone: string;
};

export function login(payload: LoginRequest) {
  return apiRequest<AuthResponse>("/auth/login", {
    body: payload,
    method: "POST",
  });
}

export function changeTemporaryPassword(payload: ChangeTemporaryPasswordRequest) {
  return apiRequest<void>("/auth/change-temporary-password", {
    body: payload,
    method: "POST",
  });
}

export function getMe(accessToken: string) {
  return apiRequest<AuthenticatedUser>("/auth/me", {
    method: "GET",
    token: accessToken,
  });
}

export function refreshSession(csrfToken: string) {
  return apiRequest<AuthResponse>("/auth/refresh", {
    csrfToken,
    method: "POST",
  });
}

export function logout(csrfToken?: string) {
  return apiRequest<void>("/auth/logout", {
    csrfToken,
    method: "POST",
  });
}

export function createPatient(payload: CreatePatientRequest) {
  return apiRequest<AuthenticatedUser>("/mobile/pacientes", {
    body: payload,
    method: "POST",
  });
}
