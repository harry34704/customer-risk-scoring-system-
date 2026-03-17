import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { BackendError, backendFetch } from "@/lib/api";

export async function fetchServerJson<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = cookies().get(AUTH_COOKIE_NAME)?.value;
  if (!accessToken) {
    redirect("/login");
  }

  try {
    return await backendFetch<T>(path, accessToken, init);
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      redirect("/logout");
    }
    throw error;
  }
}
