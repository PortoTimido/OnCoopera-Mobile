import Constants from "expo-constants";
import { Platform } from "react-native";

const LOCAL_API_PATH = "/api";
const LOCAL_API_PORT = 3000;
const WEB_DEFAULT_API_URL = `http://localhost:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
const NETWORK_ERROR_MESSAGE =
  "Nao foi possivel conectar a API. Verifique se o backend esta rodando e se o celular esta na mesma rede do computador.";

export type ApiErrorBody = {
  error?: string;
  message?: string | string[];
  statusCode?: number;
  [key: string]: unknown;
};

export class ApiError extends Error {
  readonly body?: ApiErrorBody;
  readonly status: number;

  constructor(status: number, message: string, body?: ApiErrorBody) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  csrfToken?: string;
  headers?: HeadersInit;
  token?: string | null;
};

function extractLanHost(hostUri?: string | null) {
  if (!hostUri) {
    return undefined;
  }

  const hostWithOptionalPort = hostUri.replace(/^[a-zA-Z]+:\/\//, "").split("/")[0];
  const host = hostWithOptionalPort.split(":")[0];

  if (!host || host === "localhost" || host === "127.0.0.1") {
    return undefined;
  }

  return host;
}

function getExpoHostUri() {
  return Constants.expoConfig?.hostUri ?? Constants.linkingUri;
}

export function getLocalApiBaseUrlFromHostUri(hostUri?: string | null, platform = Platform.OS) {
  if (platform === "web") {
    return WEB_DEFAULT_API_URL;
  }

  const host = extractLanHost(hostUri);

  return host ? `http://${host}:${LOCAL_API_PORT}${LOCAL_API_PATH}` : WEB_DEFAULT_API_URL;
}

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? getLocalApiBaseUrlFromHostUri(getExpoHostUri());
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

async function fetchApi(input: string, init: RequestInit) {
  try {
    return await fetch(input, init);
  } catch (error) {
    throw new ApiError(0, NETWORK_ERROR_MESSAGE, {
      error: "NETWORK_ERROR",
      message: error instanceof Error ? error.message : NETWORK_ERROR_MESSAGE,
    });
  }
}

function getErrorMessage(body: ApiErrorBody | undefined, fallback: string) {
  if (!body?.message) {
    return fallback;
  }

  return Array.isArray(body.message) ? body.message.join(" ") : body.message;
}

async function parseJsonSafely(response: Response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest<TResponse>(path: string, options: ApiRequestOptions = {}) {
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  if (options.csrfToken) {
    headers.set("x-csrf-token", options.csrfToken);
  }

  const response = await fetchApi(buildApiUrl(path), {
    ...options,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body = (await parseJsonSafely(response)) as ApiErrorBody | undefined;
    throw new ApiError(response.status, getErrorMessage(body, "Nao foi possivel concluir a solicitacao."), body);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await parseJsonSafely(response)) as TResponse;
}
