import Constants from "expo-constants";
import { fetch as expoFetch } from "expo/fetch";
import { Platform } from "react-native";

const LOCAL_API_PATH = "/api";
const LOCAL_API_PORT = 3000;
const WEB_DEFAULT_API_URL = `http://localhost:${LOCAL_API_PORT}${LOCAL_API_PATH}`;
const NETWORK_ERROR_MESSAGE =
  "Nao foi possivel conectar a API. Verifique se o backend esta rodando e se o celular esta na mesma rede do computador.";

export type ApiErrorBody = {
  error?: string;
  message?: string | string[];
  nativeError?: {
    cause?: string;
    message?: string;
    name?: string;
  };
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
  diagnostics?: ApiRequestDiagnostics;
  headers?: HeadersInit;
  token?: string | null;
};

export type ApiRequestDiagnostics = {
  feature: string;
  metadata?: Record<string, boolean | number | string | undefined>;
};

function createRequestId() {
  return `mobile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeErrorDetails(error: unknown) {
  if (!(error instanceof Error)) {
    return { message: "Erro não serializável", name: typeof error };
  }

  return {
    cause: error.cause instanceof Error ? error.cause.message : typeof error.cause === "string" ? error.cause : undefined,
    message: error.message,
    name: error.name,
  };
}

function logApiDiagnostic(event: string, requestId: string, details: Record<string, unknown>) {
  if (!__DEV__) return;
  console.info("[api-diagnostic]", { event, requestId, ...details });
}

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
    return await expoFetch(input, init);
  } catch (error) {
    const nativeError = safeErrorDetails(error);
    throw new ApiError(0, NETWORK_ERROR_MESSAGE, {
      error: "NETWORK_ERROR",
      message: nativeError.message ?? NETWORK_ERROR_MESSAGE,
      nativeError,
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
  const { body, csrfToken, diagnostics, headers: suppliedHeaders, token, ...requestOptions } = options;
  const headers = new Headers(suppliedHeaders);
  const isFormData = body instanceof FormData;
  const requestId = diagnostics ? createRequestId() : undefined;
  const url = buildApiUrl(path);
  const startedAt = Date.now();

  headers.set("Accept", "application/json");

  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (csrfToken) {
    headers.set("x-csrf-token", csrfToken);
  }

  if (requestId) {
    headers.set("X-Request-Id", requestId);
    logApiDiagnostic("request-start", requestId, {
      bodyType: isFormData ? "multipart/form-data" : body === undefined ? "empty" : "application/json",
      feature: diagnostics?.feature,
      method: requestOptions.method ?? "GET",
      metadata: diagnostics?.metadata,
      url: url.split("?", 1)[0],
    });
  }

  let response: Response;
  try {
    response = await fetchApi(url, {
      ...requestOptions,
      body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
      credentials: "include",
      headers,
    });
  } catch (error) {
    if (requestId) {
      const nativeError = error instanceof ApiError ? error.body?.nativeError : safeErrorDetails(error);
      logApiDiagnostic("request-network-failure", requestId, {
        durationMillis: Date.now() - startedAt,
        feature: diagnostics?.feature,
        nativeError,
        url: url.split("?", 1)[0],
      });
    }
    throw error;
  }

  if (requestId) {
    logApiDiagnostic("response-received", requestId, {
      durationMillis: Date.now() - startedAt,
      feature: diagnostics?.feature,
      responseRequestId: response.headers.get("x-request-id") ?? undefined,
      status: response.status,
    });
  }

  if (!response.ok) {
    const body = (await parseJsonSafely(response)) as ApiErrorBody | undefined;
    throw new ApiError(response.status, getErrorMessage(body, "Nao foi possivel concluir a solicitacao."), body);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await parseJsonSafely(response)) as TResponse;
}
