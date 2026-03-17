"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { fetchClientJson } from "@/lib/api";

export function RescoreButton({ applicantId }: { applicantId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetchClientJson(`/applicants/${applicantId}/rescore`, {
        method: "POST"
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleClick} disabled={loading}>
      {loading ? "Rescoring..." : "Rescore applicant"}
    </Button>
  );
}

