import { apiRequest } from "@/lib/api/client";
import type { File as ExpoFile } from "expo-file-system";

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
  imagemUrl?: string | null;
};

export type AuthResponse = {
  accessToken: string;
  usuario: AuthenticatedUser;
};

export type PendingTermsAcceptanceResponse = {
  aceiteTermosUsoPendente: true;
  tokenAceite: string;
  usuario: AuthenticatedUser;
};

export type LoginResponse = AuthResponse | PendingTermsAcceptanceResponse;

export type TermsAcceptanceResponse = {
  accessToken: string;
};

export type LoginRequest = {
  identificador: string;
  senha: string;
};

export type GoogleLoginRequest = {
  idToken: string;
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

export type PatientAddress = AddressRequest & {
  id: string;
};

export type PatientDetails = {
  endereco: PatientAddress | null;
  usuario: AuthenticatedUser;
};

export type UpdatePatientRequest = Partial<{
  dataNascimento: string;
  email: string;
  endereco: AddressRequest;
  login: string;
  nome: string;
  telefone: string;
}>;

export type ChangePasswordRequest = {
  novaSenha: string;
  senhaAtual: string;
};

export type PasswordRecoveryRequest = {
  email: string;
};

export type PasswordRecoveryVerifyRequest = PasswordRecoveryRequest & {
  code: string;
};

export type PasswordRecoveryVerifyResponse = {
  resetToken: string;
};

export type PasswordRecoveryResetRequest = {
  newPassword: string;
  passwordConfirmation: string;
  resetToken: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAuthenticatedUser(value: unknown): AuthenticatedUser {
  if (
    !isRecord(value) ||
    typeof value.dataNascimento !== "string" ||
    typeof value.email !== "string" ||
    typeof value.id !== "string" ||
    typeof value.login !== "string" ||
    typeof value.nome !== "string" ||
    !Array.isArray(value.perfisAdministrativos) ||
    typeof value.status !== "string" ||
    typeof value.telefone !== "string" ||
    typeof value.tipo !== "string" ||
    typeof value.trocaSenhaObrigatoria !== "boolean" ||
    !(typeof value.ultimoAcesso === "string" || value.ultimoAcesso === null)
  ) {
    throw new Error("Resposta de autenticação inválida.");
  }

  return value as AuthenticatedUser;
}

function parseLoginResponse(value: unknown): LoginResponse {
  if (!isRecord(value)) {
    throw new Error("Resposta de autenticação inválida.");
  }

  const usuario = parseAuthenticatedUser(value.usuario);

  if (value.aceiteTermosUsoPendente === true && typeof value.tokenAceite === "string" && value.tokenAceite.trim()) {
    return { aceiteTermosUsoPendente: true, tokenAceite: value.tokenAceite, usuario };
  }

  if (typeof value.accessToken !== "string" || !value.accessToken.trim()) {
    throw new Error("Resposta de autenticação inválida.");
  }

  return { accessToken: value.accessToken, usuario };
}

export async function login(payload: LoginRequest) {
  const response = await apiRequest<unknown>("/auth/login", {
    body: payload,
    method: "POST",
  });

  return parseLoginResponse(response);
}

export async function loginWithGoogle(payload: GoogleLoginRequest) {
  const response = await apiRequest<unknown>("/auth/google", {
    body: payload,
    method: "POST",
  });

  return parseLoginResponse(response);
}

export async function acceptTermsOfUse(tokenAceite: string) {
  const response = await apiRequest<unknown>("/mobile/aceites-documentos/termos-uso", {
    method: "POST",
    token: tokenAceite,
  });

  if (!isRecord(response) || typeof response.accessToken !== "string" || !response.accessToken.trim()) {
    throw new Error("Resposta de aceite inválida.");
  }

  return { accessToken: response.accessToken } satisfies TermsAcceptanceResponse;
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

export function updatePatientProfile(payload: UpdatePatientRequest, accessToken: string) {
  return apiRequest<PatientDetails>("/mobile/pacientes/me", {
    body: payload,
    method: "PATCH",
    token: accessToken,
  });
}

export function getPatientProfile(accessToken: string) {
  return apiRequest<PatientDetails>("/mobile/pacientes/me", {
    method: "GET",
    token: accessToken,
  });
}

export function changePassword(payload: ChangePasswordRequest, accessToken: string) {
  return apiRequest<void>("/auth/change-password", {
    body: payload,
    method: "POST",
    token: accessToken,
  });
}

export function requestPatientPasswordRecovery(payload: PasswordRecoveryRequest) {
  return apiRequest<{ message: string }>("/auth/password-recovery/patient/request", {
    body: payload,
    method: "POST",
  });
}

export function verifyPatientPasswordRecoveryCode(payload: PasswordRecoveryVerifyRequest) {
  return apiRequest<PasswordRecoveryVerifyResponse>("/auth/password-recovery/patient/verify", {
    body: payload,
    method: "POST",
  });
}

export function resetPatientPasswordWithRecoveryToken(payload: PasswordRecoveryResetRequest) {
  return apiRequest<void>("/auth/password-recovery/patient/reset", {
    body: payload,
    method: "POST",
  });
}

export function uploadOwnImage(image: ExpoFile, accessToken: string) {
  const body = new FormData();
  body.append("imagem", image);

  return apiRequest<AuthenticatedUser>("/auth/me/imagem", {
    body,
    method: "POST",
    token: accessToken,
  });
}

export function deleteOwnImage(accessToken: string) {
  return apiRequest<void>("/auth/me/imagem", {
    method: "DELETE",
    token: accessToken,
  });
}
