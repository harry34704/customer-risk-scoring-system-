export function readPublicEnv(name: "NEXT_PUBLIC_API_BASE_URL") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
