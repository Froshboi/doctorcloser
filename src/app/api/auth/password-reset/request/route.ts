import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabasePublicClient, isSupabaseAuthConfigured } from "@/src/lib/auth";

const requestSchema = z.object({
  email: z.string().trim().email().max(254),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  if (!isSupabaseAuthConfigured()) {
    return json(
      { error: "Set NEXT_PUBLIC_SUPABASE_URL and a Supabase anon or publishable key to enable password recovery." },
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return json({ error: "Set NEXT_PUBLIC_APP_URL to the deployed site URL." }, 503);
  }

  try {
    const redirectUrl = new URL("/auth/callback", appUrl);
    redirectUrl.searchParams.set("next", "/reset-password");

    const supabase = await createSupabasePublicClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email.toLowerCase(),
      { redirectTo: redirectUrl.toString() },
    );

    if (error) {
      console.error("Supabase password recovery request failed.", error.code ?? error.name);
      return json({ error: "Unable to request a reset email. Check Supabase Auth settings." }, 503);
    }

    return json({
      message: "If an account matches that email address, Supabase will send a password reset link.",
    });
  } catch (error) {
    console.error(
      "Password recovery request failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json({ error: "Unable to request a reset email. Please try again later." }, 503);
  }
}
