import { redirect } from "next/navigation";

import { backendFetch } from "@/lib/api";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchServerJson<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/login");
  }

  return backendFetch<T>(path, session.access_token, init);
}
