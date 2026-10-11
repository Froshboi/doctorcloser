"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!process.env.DATABASE_URL) return children;

  return <SessionProvider>{children}</SessionProvider>;
}
