"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to request a password reset.");
        return;
      }
      setMessage(result.message ?? "If the account exists, a reset link will be sent.");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <h1>Reset your password</h1>
        <p>Enter the email address on your account and we’ll send a secure reset link.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reset-email">Email address</label>
            <input
              id="reset-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {message && <p className="appointment-status success" role="status">{message}</p>}
          <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
            {pending ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-switch"><Link href="/login">Back to sign in</Link></p>
      </section>
    </main>
  );
}
