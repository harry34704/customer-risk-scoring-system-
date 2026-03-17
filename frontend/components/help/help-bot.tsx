"use client";

import { Bot, ChevronRight, LifeBuoy, Search, X } from "lucide-react";
import { startTransition, useDeferredValue, useState } from "react";

import { FAQ_ENTRIES } from "@/lib/faq";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All" },
  { id: "login", label: "Login" },
  { id: "workspace", label: "Workspace" },
  { id: "imports", label: "Imports" },
  { id: "scoring", label: "Scoring" },
  { id: "reports", label: "Reports" },
  { id: "rules", label: "Rules" }
] as const;

export function HelpBot() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]["id"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(FAQ_ENTRIES[0]?.id ?? null);
  const deferredQuery = useDeferredValue(query);

  const filteredEntries = FAQ_ENTRIES.filter((entry) => {
    const matchesCategory = category === "all" || entry.category === category;
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      entry.question.toLowerCase().includes(normalizedQuery) ||
      entry.answer.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const selectedEntry = filteredEntries.find((entry) => entry.id === selectedId) ?? filteredEntries[0] ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="no-print fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border border-[color:var(--line)] bg-[color:var(--card-strong)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--surface-shadow-soft)] transition hover:-translate-y-0.5"
      >
        {open ? <X className="h-4 w-4 text-[color:var(--signal-strong)]" /> : <Bot className="h-4 w-4 text-[color:var(--signal-strong)]" />}
        Help bot
      </button>

      {open ? (
        <aside className="no-print fixed bottom-24 right-5 z-40 w-[min(420px,calc(100vw-2rem))] rounded-[28px] border border-[color:var(--line)] bg-[color:var(--card-strong)] p-5 shadow-[var(--surface-shadow)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--signal-strong)]">
                <LifeBuoy className="h-4 w-4" />
                Guided help
              </div>
              <h3 className="mt-2 text-xl font-semibold text-[color:var(--foreground)]">FAQ assistant</h3>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                This bot does not invent answers. It only searches the product FAQs and usage guidance built into the app.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[color:var(--line)] p-2 text-[color:var(--muted)] transition hover:text-[color:var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--card)] px-4 py-3">
            <div className="flex items-center gap-3 text-[color:var(--muted)]">
              <Search className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  startTransition(() => setQuery(nextValue));
                }}
                placeholder="Ask about login, imports, scores, or reports"
                className="w-full bg-transparent text-sm text-[color:var(--foreground)] outline-none placeholder:text-[color:var(--muted)]"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition",
                  category === item.id
                    ? "border-[color:var(--signal-strong)] bg-[color:var(--signal-soft)] text-[color:var(--signal-strong)]"
                    : "border-[color:var(--line)] bg-[color:var(--card)] text-[color:var(--muted)]"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-2">
              {filteredEntries.length ? (
                filteredEntries.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setSelectedId(entry.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[20px] border px-4 py-3 text-left transition",
                      selectedEntry?.id === entry.id
                        ? "border-[color:var(--signal-strong)] bg-[color:var(--signal-soft)]"
                        : "border-[color:var(--line)] bg-[color:var(--card)] hover:border-[color:var(--line-strong)]"
                    )}
                  >
                    <span className="pr-4 text-sm font-medium text-[color:var(--foreground)]">{entry.question}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[color:var(--muted)]" />
                  </button>
                ))
              ) : (
                <div className="rounded-[20px] border border-dashed border-[color:var(--line)] px-4 py-6 text-sm text-[color:var(--muted)]">
                  No FAQ matched that search. Try a simpler term such as `login`, `CSV`, or `score`.
                </div>
              )}
            </div>

            <div className="rounded-[24px] border border-[color:var(--line)] bg-[color:var(--card)] p-4">
              {selectedEntry ? (
                <>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--signal-strong)]">
                    {selectedEntry.category}
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{selectedEntry.question}</h4>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{selectedEntry.answer}</p>
                </>
              ) : (
                <p className="text-sm text-[color:var(--muted)]">Choose a question to see the answer.</p>
              )}
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
