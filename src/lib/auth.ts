import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { prisma } from "@/src/lib/prisma";

export function isSupabaseAuthConfigured() {
  return Boolean(
    (process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) &&
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.SUPABASE_ANON_KEY),
  );
}

function getSupabaseAuthConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and a Supabase anon or publishable key.",
    );
  }

  return { url, key };
}

export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseAuthConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies; middleware refreshes sessions.
        }
      },
    },
  });
}

export async function createSupabasePublicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const { url, key } = getSupabaseAuthConfig();

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function auth() {
  if (!process.env.DATABASE_URL || !isSupabaseAuthConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const email = user.email?.trim().toLowerCase() ?? null;
  const name =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : null;

  const linkedUser = await prisma.user.findUnique({
    where: { authUserId: user.id },
    select: { id: true, name: true, email: true },
  });

  if (linkedUser) {
    if (email && linkedUser.email !== email) {
      return prisma.user.update({
        where: { id: linkedUser.id },
        data: { email, ...(name && !linkedUser.name ? { name } : {}) },
        select: { id: true, name: true, email: true },
      }).then((record) => ({ user: record }));
    }
    return { user: linkedUser };
  }

  const legacyUser = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true },
      })
    : null;

  if (legacyUser && !user.email_confirmed_at) {
    throw new Error("Confirm your Supabase email address before linking your existing account.");
  }

  const appUser = legacyUser
    ? await prisma.user.update({
        where: { id: legacyUser.id },
        data: {
          authUserId: user.id,
          ...(name && !legacyUser.name ? { name } : {}),
        },
        select: { id: true, name: true, email: true },
      })
    : await prisma.user.create({
        data: {
          authUserId: user.id,
          email,
          name,
        },
        select: { id: true, name: true, email: true },
      });

  return { user: appUser };
}
