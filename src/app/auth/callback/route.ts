import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth, createSupabaseServerClient } from "@/src/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const next =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("Supabase email callback failed.", error.code ?? error.name);
    return NextResponse.redirect(new URL("/login?error=confirmation", request.url));
  }

  try {
    if (!(await auth())) {
      throw new Error("Supabase session could not be synchronized.");
    }
  } catch (error) {
    console.error(
      "Supabase user synchronization failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return NextResponse.redirect(new URL("/login?error=setup", request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));
  return response;
}
