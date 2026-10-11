import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword } from "@/src/lib/password-reset";

const confirmSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: z.string().min(8).max(128),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return json({ error: "Password reset is unavailable until the database is configured." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Use a valid reset link and a password of at least 8 characters." }, 400);
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const updated = await resetPassword(parsed.data.token, passwordHash);
    if (!updated) {
      return json({ error: "This reset link is invalid, expired, or already used." }, 400);
    }

    return json({ message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    console.error(
      "Password reset confirmation failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json({ error: "Unable to reset your password. Please try again later." }, 500);
  }
}
