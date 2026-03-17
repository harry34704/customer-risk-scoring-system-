import { fetchServerJson } from "@/lib/server-api";
import { type UserProfile } from "@/lib/types";

export async function fetchUserProfile() {
  return fetchServerJson<UserProfile>("/me");
}
