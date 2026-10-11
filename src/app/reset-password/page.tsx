import { PasswordResetConfirmForm } from "@/src/components/password-reset-confirm-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset password | DoctorCloser",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return <PasswordResetConfirmForm token={token ?? ""} />;
}
