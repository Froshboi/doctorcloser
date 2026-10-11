import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isPasswordResetConfigured,
  PASSWORD_RESET_RESPONSE,
  requestPasswordReset,
} from "@/src/lib/password-reset";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
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
  if (!isPasswordResetConfigured()) {
    return json(
      {
        error:
          "Password reset is not configured. Set DATABASE_URL, RESEND_API_KEY, EMAIL_FROM, and NEXT_PUBLIC_APP_URL in the deployment environment.",
      },
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Enter a valid email address." }, 400);
  }

  try {
    await requestPasswordReset(parsed.data.email);
    return json({ message: PASSWORD_RESET_RESPONSE });
  } catch (error) {
    console.error(
      "Password reset request failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json({ error: "Password reset email could not be sent. Please try again later." }, 503);
  }
}
