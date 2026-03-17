"use client";

import { Palette } from "lucide-react";

import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className={cn("surface-panel rounded-[28px] p-4", compact ? "w-full" : "")}>
      <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--foreground)]">
        <Palette className="h-4 w-4 text-[color:var(--signal-strong)]" />
        Theme studio
      </div>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        Switch between calm portfolio themes without leaving the page.
      </p>

      <div className="mt-4 space-y-3">
        {themes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTheme(item.id)}
            className={cn(
              "flex w-full items-center justify-between rounded-[22px] border px-4 py-3 text-left transition",
              theme === item.id
                ? "border-[color:var(--signal-strong)] bg-[color:var(--signal-soft)]"
                : "border-[color:var(--line)] bg-[color:var(--card)] hover:border-[color:var(--line-strong)]"
            )}
          >
            <div>
              <div className="font-semibold text-[color:var(--foreground)]">{item.name}</div>
              <div className="mt-1 text-sm text-[color:var(--muted)]">{item.summary}</div>
            </div>
            <div className="flex gap-2">
              {item.swatches.map((swatch) => (
                <span
                  key={`${item.id}-${swatch}`}
                  className="h-4 w-4 rounded-full border border-white/60"
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
