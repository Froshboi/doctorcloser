"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { AuthActionState } from "@/src/lib/auth-actions";

export function AuthForm({ mode, action }: { mode: "login" | "signup"; action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>; }) {
  const [state, formAction] = useActionState(action, { error: "" });

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p>{mode === "signup" ? "Book healthcare appointments in under a minute." : "Sign in to manage your appointments."}</p>

        <form action={formAction}>
          {mode === "signup" && (
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" autoComplete="name" required />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="identifier">Phone number or email</label>
            <input id="identifier" name="identifier" type="text" autoComplete="username" required placeholder="0802 000 0000" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} />
          </div>

          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          <SubmitButton mode={mode} />
        </form>

        <p className="auth-switch">
          {mode === "signup" ? "Already have an account? " : "New to DoctorCloser? "}
          <Link href={mode === "signup" ? "/login" : "/signup"}>{mode === "signup" ? "Sign in" : "Create an account"}</Link>
        </p>
        {mode === "login" && (
          <p className="auth-switch"><Link href="/forgot-password">Forgot your password?</Link></p>
        )}
      </div>
    </main>
  );
}

function SubmitButton({ mode }: { mode: "login" | "signup" }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
      {pending ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
    </button>
  );
}
