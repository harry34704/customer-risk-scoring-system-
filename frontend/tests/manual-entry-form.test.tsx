import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { ManualEntryForm } from "@/components/applicants/manual-entry-form";
import { fetchClientJson } from "@/lib/api";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  })
}));

vi.mock("@/lib/api", () => ({
  fetchClientJson: vi.fn()
}));

describe("ManualEntryForm", () => {
  it("submits applicant data and navigates to the detail page", async () => {
    vi.mocked(fetchClientJson).mockResolvedValue({
      applicant: { id: "applicant-123" }
    } as never);

    render(<ManualEntryForm />);

    await userEvent.type(screen.getByPlaceholderText("First name"), "Ariana");
    await userEvent.type(screen.getByPlaceholderText("Last name"), "Cole");
    await userEvent.type(screen.getByPlaceholderText("Email"), "ariana@example.com");
    await userEvent.click(screen.getByRole("button", { name: /create applicant/i }));

    await waitFor(() => expect(fetchClientJson).toHaveBeenCalled());
    const request = vi.mocked(fetchClientJson).mock.calls[0];
    expect(request[0]).toBe("/applicants");
    expect(JSON.parse(request[1]?.body as string).first_name).toBe("Ariana");
    expect(pushMock).toHaveBeenCalledWith("/applicants/applicant-123");
  });
});
