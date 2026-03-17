import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { WorkspaceBootstrapCard } from "@/components/workspace/workspace-bootstrap-card";
import { fetchClientJson } from "@/lib/api";

const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock
  })
}));

vi.mock("@/lib/api", () => ({
  fetchClientJson: vi.fn()
}));

describe("WorkspaceBootstrapCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the demo workspace and refreshes the page", async () => {
    vi.mocked(fetchClientJson).mockResolvedValue({
      bootstrapped: true,
      message: "Loaded 500 demo applicants into your workspace.",
      workspace_summary: {
        applicant_count: 500,
        rule_count: 9,
        payment_count: 6000,
        is_empty: false,
        can_bootstrap_demo: true
      }
    } as never);

    render(
      <WorkspaceBootstrapCard
        title="Load a portfolio into this account."
        description="Use the seeded demo workspace."
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /load demo workspace/i }));

    await waitFor(() =>
      expect(fetchClientJson).toHaveBeenCalledWith("/settings/bootstrap-demo", {
        method: "POST"
      })
    );
    expect(refreshMock).toHaveBeenCalled();
    expect(screen.getByText(/loaded 500 demo applicants/i)).toBeInTheDocument();
  });
});
