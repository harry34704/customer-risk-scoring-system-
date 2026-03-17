export function readPublicEnv(name: "NEXT_PUBLIC_API_BASE_URL") {
  const value =
    name === "NEXT_PUBLIC_API_BASE_URL"
      ? process.env.NEXT_PUBLIC_API_BASE_URL
      : undefined;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function readPublicApiBaseUrl() {
  const value = readPublicEnv("NEXT_PUBLIC_API_BASE_URL").trim().replace(/\/+$/, "");
  return value.endsWith("/api/v1") ? value : `${value}/api/v1`;
}
