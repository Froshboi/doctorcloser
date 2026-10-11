import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { createAuthRequest, HmoServiceError } from "@/src/lib/hmoService";

const authRequestSchema = z.object({
  appointmentId: z.string().trim().min(1).max(128),
  diagnosisSummary: z.string().trim().min(3).max(4000),
  hmoPolicyId: z.string().trim().min(1).max(128).optional(),
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
      { error: "HMO authorization is unavailable until the database is configured." },
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

  const parsed = authRequestSchema.safeParse(body);
  if (!parsed.success) {
    return json(
      {
        error: "An appointment ID and diagnosis summary are required.",
        issues: parsed.error.flatten(),
      },
      400,
    );
  }

  try {
    const authRequest = await createAuthRequest(
      parsed.data.appointmentId,
      parsed.data.diagnosisSummary,
      session.user.id,
      parsed.data.hmoPolicyId,
    );
    return json({ authorizationRequest: authRequest }, 201);
  } catch (error) {
    if (error instanceof HmoServiceError) {
      const status =
        error.code === "NOT_FOUND" ? 404 :
        error.code === "INELIGIBLE_POLICY" ? 422 :
        error.code === "INVALID_APPOINTMENT" ? 409 : 400;
      return json({ error: error.message }, status);
    }
    console.error(
      "HMO authorization request failed.",
      error instanceof Error ? error.name : "Unknown error",
    );
    return json({ error: "Unable to submit the HMO authorization request." }, 500);
  }
}
