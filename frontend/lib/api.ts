import { readPublicApiBaseUrl } from "@/lib/env";
import { clearStoredAccessToken, getClientAccessToken } from "@/lib/auth";

const apiBaseUrl = () => readPublicApiBaseUrl();

export class BackendError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
  }
}

function buildHeaders(accessToken: string, headers: HeadersInit | undefined, includeJsonContentType: boolean) {
  const nextHeaders = new Headers(headers);
  if (includeJsonContentType && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }
  nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  return nextHeaders;
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    if (payload?.detail) {
      return payload.detail;
    }
  }

  const message = await response.text();
  return message || `Backend request failed with status ${response.status}`;
}

async function sendAuthenticatedRequest(
  path: string,
  accessToken: string,
  init: RequestInit | undefined,
  includeJsonContentType: boolean
) {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(accessToken, init?.headers, includeJsonContentType),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new BackendError(response.status, await readErrorMessage(response));
  }

  return response;
}

function handleClientAuthFailure(error: unknown) {
  if (error instanceof BackendError && error.status === 401) {
    clearStoredAccessToken();
    if (typeof window !== "undefined") {
      window.location.assign("/logout");
    }
  }
}

export async function backendFetch<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await sendAuthenticatedRequest(path, accessToken, init, true);
  return (await response.json()) as T;
}

export async function fetchClientJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    return await backendFetch<T>(path, getClientAccessToken(), init);
  } catch (error) {
    handleClientAuthFailure(error);
    throw error;
  }
}

export async function fetchClientFile(path: string): Promise<Blob> {
  try {
    const response = await sendAuthenticatedRequest(path, getClientAccessToken(), undefined, false);
    return response.blob();
  } catch (error) {
    handleClientAuthFailure(error);
    throw error;
  }
}

export async function fetchClientFormData<T>(path: string, formData: FormData, init?: Omit<RequestInit, "body">): Promise<T> {
  try {
    const response = await sendAuthenticatedRequest(
      path,
      getClientAccessToken(),
      {
        ...init,
        method: init?.method ?? "POST",
        body: formData
      },
      false
    );
    return (await response.json()) as T;
  } catch (error) {
    handleClientAuthFailure(error);
    throw error;
  }
}
