import { isNotFoundError } from "next/dist/client/components/not-found";
import { isRedirectError } from "next/dist/client/components/redirect";

export function rethrowIfNavigationError(error: unknown) {
  if (isRedirectError(error) || isNotFoundError(error)) {
    throw error;
  }
}
