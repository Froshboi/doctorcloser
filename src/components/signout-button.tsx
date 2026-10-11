"use client";

import { signOutAction } from "@/src/lib/auth-actions";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button className="btn btn-secondary btn-small" type="submit">Sign out</button>
    </form>
  );
}
