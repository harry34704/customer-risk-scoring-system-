"use client";

import { createBrowserClient } from "@supabase/ssr";

import { readPublicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    readPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

