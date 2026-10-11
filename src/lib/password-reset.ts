import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/src/lib/prisma";

const RESET_TOKEN_TTL_MINUTES = 30;
const RESET_REQUEST_COOLDOWN_SECONDS = 60;

export const PASSWORD_RESET_RESPONSE =
  "If an account matches that email address, a password reset link will be sent shortly.";

export function isPasswordResetConfigured() {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.RESEND_API_KEY &&
    process.env.EMAIL_FROM &&
    (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL),
  );
}

function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (!configuredUrl) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");

  const appUrl = new URL(configuredUrl);
  if (process.env.NODE_ENV === "production" && appUrl.protocol !== "https:") {
    throw new Error("The production app URL must use HTTPS.");
  }

  return appUrl;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  const resetUrl = getPublicAppUrl();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, passwordHash: true },
  });

  if (!user?.email || !user.passwordHash) return;

  const cutoff = new Date(Date.now() - RESET_REQUEST_COOLDOWN_SECONDS * 1000);
  const recentRequest = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, createdAt: { gt: cutoff } },
    select: { id: true },
  });

  if (recentRequest) return;

  const rawToken = randomBytes(32).toString("hex");
  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
      },
    }),
  ]);

  resetUrl.pathname = "/reset-password";
  resetUrl.search = new URLSearchParams({ token: rawToken }).toString();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [user.email],
        subject: "Reset your DoctorCloser password",
        text: [
          "We received a request to reset your DoctorCloser password.",
          `Use this one-time link within ${RESET_TOKEN_TTL_MINUTES} minutes:`,
          resetUrl.toString(),
          "If you did not request a reset, you can ignore this email.",
        ].join("\n\n"),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`Password reset email delivery failed with status ${response.status}.`);
    }
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, tokenHash: hashToken(rawToken) },
    });
    console.error(
      "Password reset email delivery failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
  }
}

export async function resetPassword(token: string, passwordHash: string) {
  const hashedToken = hashToken(token);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const resetToken = await tx.passwordResetToken.findUnique({
      where: { tokenHash: hashedToken },
      select: { id: true, userId: true, expiresAt: true },
    });

    if (!resetToken || resetToken.expiresAt <= now) return false;

    const consumed = await tx.passwordResetToken.deleteMany({
      where: {
        id: resetToken.id,
        tokenHash: hashedToken,
        expiresAt: { gt: now },
      },
    });

    if (consumed.count !== 1) return false;

    await tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, updatedAt: now },
    });
    await tx.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return true;
  }, { isolationLevel: "Serializable" });
}
