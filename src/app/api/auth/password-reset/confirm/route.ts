import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient, isSupabaseAuthConfigured } from "@/src/lib/auth";

const confirmSchema = z.object({
  password: z.string().min(8).max(128),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return json({ error: "DATABASE_URL is missing at runtime. Configure it in Vercel and redeploy." }, 503);
  }
  if (!isSupabaseAuthConfigured()) {
    return json({ error: "Supabase Auth is not configured. Check the Vercel Supabase URL and anon or publishable key." }, 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = confirmSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "Choose a password with at least 8 characters." }, 400);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ error: "This reset link is invalid or expired. Request a new link." }, 401);
    }

    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) {
      console.error("Supabase password update failed.", error.code ?? error.name);
      return json({ error: "Supabase could not update the password. Request a new reset link." }, 400);
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error("Password reset session cleanup failed.", signOutError.code ?? signOutError.name);
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
