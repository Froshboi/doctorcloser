"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="btn btn-secondary btn-small" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
