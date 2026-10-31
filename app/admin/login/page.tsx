"use client";

// Admin sign-in. A warm, branded welcome: festive scene on one side, a simple
// form on the other. The UI hides nothing security-relevant; the API routes
// (rate limit, identical error for unknown email and wrong password) are the
// actual enforcement boundary. Styling: components/admin/ui.tsx.
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import RibbonBand from "@/components/home/RibbonBand";
import { Alert, Button, Field, inputClass } from "@/components/admin/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Login failed");
        setSubmitting(false);
        return;
      }
      router.push("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <RibbonBand tone="green" />
      <div className="grid flex-1 md:grid-cols-2">
        <div className="relative hidden md:block">
          <Image
            src="/assets/products/clarity-essence-festive-scene-v2.jpg"
            alt=""
            fill
            priority
            sizes="50vw"
            className="object-cover object-[30%_72%]"
          />
        </div>
        <div className="flex items-center justify-center bg-peachdust px-6 py-14">
          <div className="w-full max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/brand/CHIAREL_Wordmark_RedOchre.svg" alt="CHIAREL" className="h-9 w-auto" />
            <p className="mt-8 text-[12px] uppercase tracking-[0.34em] text-ochre">Admin console</p>
            <h1 className="mt-2 font-serif text-[clamp(2rem,1.4rem+1.6vw,3rem)] leading-tight text-garden">Welcome back.</h1>
            <p className="mt-2 text-[15px] text-ink/75">Sign in to look after the House.</p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <Field label="Email">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </Field>
              {error && <Alert kind="error">{error}</Alert>}
              <Button type="submit" disabled={submitting} className="mt-1 w-full">
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
