"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { auth, createSupabaseServerClient, isSupabaseAuthConfigured } from "@/src/lib/auth";

export type AuthActionState = { error: string; message?: string };

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  identifier: z.string().trim().email("Create an account with an email address.").max(254),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  identifier: z.string().trim().email("Enter your account email address.").max(254),
  password: z.string().min(1).max(128),
});

function getAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error("Set NEXT_PUBLIC_APP_URL to the deployed app URL.");
  return new URL(value);
}

function configurationError() {
  if (!process.env.DATABASE_URL) {
    return "DATABASE_URL is missing at runtime. In Vercel, enable it for this environment and redeploy.";
  }
  return "Supabase Auth is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in Vercel, enable email/password auth in Supabase, then redeploy.";
}

export async function signUpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!process.env.DATABASE_URL || !isSupabaseAuthConfigured()) {
    return { error: configurationError() };
  }

  const parsed = signupSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const callbackUrl = getAppUrl();
    callbackUrl.pathname = "/auth/callback";
    callbackUrl.search = new URLSearchParams({ next: "/dashboard" }).toString();

    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.identifier.toLowerCase(),
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.name },
        emailRedirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      if (error.code === "user_already_exists" || error.status === 422) {
        return { error: "Unable to create an account with those details. Try signing in." };
      }
      console.error("Supabase sign-up failed.", error.code ?? error.name);
      return { error: "Supabase could not create your account. Check Auth settings and try again." };
    }

    if (!data.session) {
      return {
        error: "",
        message: "Check your email and confirm your address to finish creating your account.",
      };
    }

    if (!(await auth())) {
      throw new Error("Supabase session could not be synchronized.");
    }
  } catch (error) {
    console.error(
      "Account creation failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    if (error instanceof Error && error.message.includes("Confirm your Supabase email")) {
      return { error: "Confirm your email address in Supabase before linking your existing patient account." };
    }
    return { error: "Account created, but app setup failed. Check the database and migrations." };
  }

  redirect("/dashboard");
}

export async function signInAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!process.env.DATABASE_URL || !isSupabaseAuthConfigured()) {
    return { error: configurationError() };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.identifier.toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    if (error.code === "invalid_credentials" || error.code === "email_not_confirmed") {
      return { error: "Email or password is incorrect, or your email is not confirmed." };
    }
    console.error("Supabase sign-in failed.", error.code ?? error.name);
    return { error: "Unable to sign in. Check Supabase Auth configuration and try again." };
  }

  try {
    if (!(await auth())) {
      throw new Error("Supabase session could not be synchronized.");
    }
  } catch (error) {
    await supabase.auth.signOut();
    if (error instanceof Error && error.message.includes("Confirm your Supabase email")) {
      return { error: "Confirm your email address in Supabase before linking your existing patient account." };
    }
    console.error(
      "Account synchronization failed after sign-in.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return { error: "Could not connect your account to the app database. Check migrations." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Supabase sign-out failed.", error.code ?? error.name);
  }
  redirect("/");
}
