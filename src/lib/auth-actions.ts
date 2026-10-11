"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export type AuthActionState = { error: string };

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  identifier: z.string().trim().min(3, "Enter a valid phone number or email."),
  password: z.string().min(8, "Use at least 8 characters."),
});

const signInSchema = z.object({
  identifier: z.string().trim().min(3, "Enter a valid phone number or email."),
  password: z.string().min(1, "Enter your password."),
});

export async function signUpAction(state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!process.env.DATABASE_URL) {
    return { error: "Account creation is unavailable until a database is configured." };
  }

  const values = Object.fromEntries(formData.entries());
  const parsed = signUpSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  const { name, identifier, password } = parsed.data;
  const isEmail = identifier.includes("@");
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        isEmail ? { email: identifier.toLowerCase() } : { phone: identifier },
        { email: isEmail ? identifier.toLowerCase() : undefined },
      ],
    },
  });

  if (existingUser) {
    return { error: "An account already exists with that phone number or email." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser = await prisma.user.create({
    data: {
      name,
      email: isEmail ? identifier.toLowerCase() : null,
      phone: isEmail ? null : identifier,
      passwordHash,
    },
  });

  await signIn("credentials", {
    identifier,
    password,
    redirect: false,
    userId: newUser.id,
  });

  redirect("/dashboard");
}

export async function signInAction(state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!process.env.DATABASE_URL) {
    return { error: "Sign-in is unavailable until a database is configured." };
  }

  const values = Object.fromEntries(formData.entries());
  const parsed = signInSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  try {
    await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if ((error as Error).message.includes("CredentialsSignin")) {
      return { error: "The phone number, email, or password is incorrect." };
    }
    return { error: "Unable to sign in. Please try again." };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
