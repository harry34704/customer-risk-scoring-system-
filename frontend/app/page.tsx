import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

export default async function HomePage() {
  redirect(cookies().get(AUTH_COOKIE_NAME)?.value ? "/dashboard" : "/login");
}
