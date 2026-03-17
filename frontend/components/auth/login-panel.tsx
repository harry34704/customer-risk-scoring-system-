"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser, registerUser, storeAccessToken } from "@/lib/auth";

type Mode = "signin" | "signup";

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("demo@riskscore.local");
  const [password, setPassword] = useState("Demo123!");
  const [fullName, setFullName] = useState("Portfolio Analyst");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = useMemo(
    () => (mode === "signin" ? "Sign in to continue" : "Create a demo-capable workspace"),
    [mode]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session =
        mode === "signin"
          ? await loginUser({
              email,
              password
            })
          : await registerUser({
              full_name: fullName,
              email,
              password
            });
      storeAccessToken(session.access_token, session.expires_at);
      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass w-full max-w-xl rounded-[36px] border border-white/80 p-8 shadow-soft">
      <div className="mb-8 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-signal">
        <ShieldCheck className="h-4 w-4" />
        In-app auth
      </div>
      <h2 className="text-3xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-sm text-slate-500">
        Use the seeded demo credentials or create a fresh analyst profile. New accounts can load a demo portfolio after sign-in.
      </p>

      <div className="mt-6 inline-flex rounded-full border border-slate-200 bg-white/80 p-1">
        {(["signin", "signup"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === item ? "bg-ink text-white" : "text-slate-500"
            }`}
          >
            {item === "signin" ? "Sign in" : "Sign up"}
          </button>
        ))}
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <div>
            <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-slate-600">
              Full name
            </label>
            <Input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </div>
        ) : null}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-600">
            Email
          </label>
          <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-600">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        ) : null}

        <Button className="w-full gap-2" type="submit" disabled={loading}>
          {loading ? "Working..." : mode === "signin" ? "Enter workspace" : "Create account"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
