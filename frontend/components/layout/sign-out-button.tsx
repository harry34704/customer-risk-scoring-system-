"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  function handleSignOut() {
    window.location.assign("/logout");
  }

  return (
    <Button variant="ghost" className="gap-2" onClick={handleSignOut}>
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  );
}
