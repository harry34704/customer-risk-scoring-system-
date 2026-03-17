import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { LoginPanel } from "@/components/auth/login-panel";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const signUpMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  }),
  useSearchParams: () => new URLSearchParams()
}));

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: vi.fn()
}));

describe("LoginPanel", () => {
  it("signs in and redirects to dashboard", async () => {
    vi.mocked(createSupabaseBrowserClient).mockReturnValue({
      auth: {
        signInWithPassword: signInWithPasswordMock.mockResolvedValue({ error: null }),
        signUp: signUpMock
      }
    } as never);

    render(<LoginPanel />);

    await userEvent.click(screen.getByRole("button", { name: /enter workspace/i }));

    await waitFor(() => expect(signInWithPasswordMock).toHaveBeenCalled());
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
    expect(refreshMock).toHaveBeenCalled();
  });
});
