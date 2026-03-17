import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border-[color:var(--signal-strong)] bg-[color:var(--signal-strong)] text-white shadow-[var(--surface-shadow-soft)] hover:opacity-95",
  secondary:
    "border-[color:var(--signal)] bg-[color:var(--signal)] text-white hover:opacity-95",
  ghost:
    "border-[color:var(--line)] bg-[color:var(--card-strong)] text-[color:var(--foreground)] hover:bg-[color:var(--card)]",
  danger:
    "border-[color:var(--danger)] bg-[color:var(--danger)] text-white hover:opacity-95"
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--signal)] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
