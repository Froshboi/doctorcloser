import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { HmoServiceError, verifyHmoPolicy } from "@/src/lib/hmoService";

const verifySchema = z.object({
  policyNumber: z.string().trim().min(1).max(120),
  providerId: z.string().trim().min(1).max(128),
});

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return json(
      { error: "HMO verification is unavailable until the database is configured." },
      503,
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return json({ error: "Authentication required." }, 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return json(
      { error: "A policy number and provider ID are required.", issues: parsed.error.flatten() },
      400,
    );
  }

  try {
    const result = await verifyHmoPolicy(
      parsed.data.policyNumber,
      parsed.data.providerId,
      session.user.id,
    );
    return json(result);
  } catch (error) {
    if (error instanceof HmoServiceError) {
      const status =
        error.code === "NOT_FOUND" ? 404 :
        error.code === "INACTIVE_PROVIDER" ? 409 :
        error.code === "INELIGIBLE_POLICY" ? 422 : 400;
      return json({ error: error.message }, status);
    }
    console.error(
      "HMO policy verification failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json({ error: "Unable to verify the HMO policy." }, 500);
  }
}
