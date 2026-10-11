"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function PasswordResetConfirmForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to reset your password.");
        return;
      }
      setMessage(result.message ?? "Password reset. You can sign in now.");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>Choose a new password</h1>
        <p>Use the secure recovery link from Supabase to choose a new password.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              name="confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="appointment-status success" role="status">{message}</p>}
          {message ? (
            <Link className="btn btn-primary btn-block" href="/login">Continue to sign in</Link>
          ) : (
            <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
              {pending ? "Updating password..." : "Update password"}
            </button>
          )}
        </form>

        <p className="auth-switch"><Link href="/forgot-password">Request a new reset link</Link></p>
      </section>
    </main>
  );
}
