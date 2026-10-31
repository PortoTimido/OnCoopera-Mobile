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
