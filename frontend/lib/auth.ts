import { readPublicEnv } from "@/lib/env";
import { type UserProfile } from "@/lib/types";

export const AUTH_COOKIE_NAME = "crs_session";

interface AuthPayload {
  access_token: string;
  token_type: string;
  expires_at: string;
  user: UserProfile;
}

function buildAuthUrl(path: string) {
  return `${readPublicEnv("NEXT_PUBLIC_API_BASE_URL")}${path}`;
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
  return message || `Request failed with status ${response.status}`;
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const target = `${name}=`;
  const match = cookies.find((cookie) => cookie.startsWith(target));
  if (!match) {
    return null;
  }
  return decodeURIComponent(match.slice(target.length));
}

export function getClientAccessToken() {
  const token = readCookie(AUTH_COOKIE_NAME);
  if (!token) {
    throw new Error("You are not signed in.");
  }
  return token;
}

export function storeAccessToken(token: string, expiresAt: string) {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(expiresAt);
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax${secure}`;
}

export function clearStoredAccessToken() {
  if (typeof document === "undefined") {
    return;
  }

  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}

async function submitAuthRequest(path: string, payload: Record<string, string>) {
  const response = await fetch(buildAuthUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as AuthPayload;
}

export function loginUser(payload: { email: string; password: string }) {
  return submitAuthRequest("/auth/login", payload);
}

export function registerUser(payload: { full_name: string; email: string; password: string }) {
  return submitAuthRequest("/auth/register", payload);
}
