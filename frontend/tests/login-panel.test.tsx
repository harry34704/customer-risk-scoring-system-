import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { LoginPanel } from "@/components/auth/login-panel";
import { loginUser, registerUser, storeAccessToken } from "@/lib/auth";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  }),
  useSearchParams: () => new URLSearchParams()
}));

vi.mock("@/lib/auth", () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  storeAccessToken: vi.fn()
}));

describe("LoginPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signs in and redirects to dashboard", async () => {
    vi.mocked(loginUser).mockResolvedValue({
      access_token: "demo-token",
      token_type: "bearer",
      expires_at: "2030-01-01T00:00:00Z",
      user: {
        id: "user-1",
        email: "demo@riskscore.local",
        full_name: "Demo User",
        role: "admin",
        is_demo: true
      }
    });

    render(<LoginPanel />);

    await userEvent.click(screen.getByRole("button", { name: /enter workspace/i }));

    await waitFor(() => expect(loginUser).toHaveBeenCalledWith({ email: "demo@riskscore.local", password: "Demo123!" }));
    expect(storeAccessToken).toHaveBeenCalledWith("demo-token", "2030-01-01T00:00:00Z");
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("registers a new analyst and redirects to dashboard", async () => {
    vi.mocked(registerUser).mockResolvedValue({
      access_token: "signup-token",
      token_type: "bearer",
      expires_at: "2030-01-01T00:00:00Z",
      user: {
        id: "user-2",
        email: "new@riskscore.local",
        full_name: "Portfolio Analyst",
        role: "analyst",
        is_demo: false
      }
    });

    render(<LoginPanel />);

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await userEvent.clear(screen.getByLabelText(/email/i));
    await userEvent.type(screen.getByLabelText(/email/i), "new@riskscore.local");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() =>
      expect(registerUser).toHaveBeenCalledWith({
        full_name: "Portfolio Analyst",
        email: "new@riskscore.local",
        password: "Demo123!"
      })
    );
    expect(storeAccessToken).toHaveBeenCalledWith("signup-token", "2030-01-01T00:00:00Z");
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });
});
