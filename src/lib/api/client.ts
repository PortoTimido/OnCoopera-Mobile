const DEFAULT_API_URL = "http://localhost:3000/api";

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

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export function buildApiUrl(path: string) {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
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

  const response = await fetch(buildApiUrl(path), {
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
