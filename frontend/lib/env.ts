export function readPublicEnv(name: "NEXT_PUBLIC_API_BASE_URL") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function readPublicApiBaseUrl() {
  const value = readPublicEnv("NEXT_PUBLIC_API_BASE_URL").trim().replace(/\/+$/, "");
  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
}
