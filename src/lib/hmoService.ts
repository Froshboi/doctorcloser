import {
  AppointmentStatus,
  HmoAuthorizationStatus,
  HmoPolicyStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/src/lib/prisma";

export class HmoServiceError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "INACTIVE_PROVIDER" | "INELIGIBLE_POLICY" | "INVALID_APPOINTMENT",
  ) {
    super(message);
    this.name = "HmoServiceError";
  }
}

export type HmoPolicyVerification = {
  valid: boolean;
  status: HmoPolicyStatus;
  provider: { id: string; name: string; code: string };
  planTier: string;
  expiresAt: string;
  source: "LOCAL_POLICY_RECORD";
};

export async function verifyHmoPolicy(
  policyNumber: string,
  providerId: string,
  userId: string,
): Promise<HmoPolicyVerification> {
  const provider = await prisma.hmoProvider.findUnique({
    where: { id: providerId },
    select: { id: true, name: true, code: true, isActive: true },
  });

  if (!provider) {
    throw new HmoServiceError("HMO provider not found.", "NOT_FOUND");
  }
  if (!provider.isActive) {
    throw new HmoServiceError("This HMO provider is not currently active.", "INACTIVE_PROVIDER");
  }

  const policy = await prisma.hmoPolicy.findFirst({
    where: {
      policyNumber: policyNumber.trim(),
      providerId,
      userId,
    },
    select: {
      id: true,
      status: true,
      planTier: true,
      expiresAt: true,
    },
  });

  if (!policy) {
    throw new HmoServiceError(
      "No policy matched the supplied details for your account.",
      "NOT_FOUND",
    );
  }

  const isPastExpiry = policy.expiresAt.getTime() <= Date.now();
  const status =
    isPastExpiry && policy.status === HmoPolicyStatus.ACTIVE
      ? HmoPolicyStatus.EXPIRED
      : policy.status;

  if (status !== policy.status) {
    await prisma.hmoPolicy.update({
      where: { id: policy.id },
      data: { status },
    });
  }

  return {
    valid: status === HmoPolicyStatus.ACTIVE && !isPastExpiry,
    status,
    provider: { id: provider.id, name: provider.name, code: provider.code },
    planTier: policy.planTier,
    expiresAt: policy.expiresAt.toISOString(),
    source: "LOCAL_POLICY_RECORD",
  };
}

export async function createAuthRequest(
  appointmentId: string,
  diagnosisSummary: string,
  userId: string,
  hmoPolicyId?: string,
) {
  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findFirst({
      where: { id: appointmentId, userId },
      select: {
        id: true,
        userId: true,
        hmoPolicyId: true,
        status: true,
      },
    });

    if (!appointment) {
      throw new HmoServiceError("Appointment not found.", "NOT_FOUND");
    }
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new HmoServiceError(
        "A cancelled appointment cannot be authorized.",
        "INVALID_APPOINTMENT",
      );
    }
    if (hmoPolicyId && appointment.hmoPolicyId && appointment.hmoPolicyId !== hmoPolicyId) {
      throw new HmoServiceError(
        "The appointment is linked to a different HMO policy.",
        "INVALID_APPOINTMENT",
      );
    }

    const policyId = hmoPolicyId ?? appointment.hmoPolicyId;
    if (!policyId) {
      throw new HmoServiceError(
        "Link a verified HMO policy to this appointment before requesting authorization.",
        "INELIGIBLE_POLICY",
      );
    }

    const policy = await tx.hmoPolicy.findFirst({
      where: { id: policyId, userId: appointment.userId },
      select: {
        id: true,
        status: true,
        expiresAt: true,
        provider: { select: { isActive: true } },
      },
    });

    if (!policy) {
      throw new HmoServiceError("HMO policy not found.", "NOT_FOUND");
    }

    if (
      !policy.provider.isActive ||
      policy.status !== HmoPolicyStatus.ACTIVE ||
      policy.expiresAt.getTime() <= Date.now()
    ) {
      throw new HmoServiceError(
        "The linked HMO policy is not currently eligible.",
        "INELIGIBLE_POLICY",
      );
    }

    if (!appointment.hmoPolicyId) {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { hmoPolicyId: policy.id },
      });
    }

    return tx.hmoAuthorizationRequest.create({
      data: {
        appointmentId: appointment.id,
        hmoPolicyId: policy.id,
        diagnosisSummary: diagnosisSummary.trim(),
        status: HmoAuthorizationStatus.PENDING,
      },
      select: {
        id: true,
        requestReference: true,
        appointmentId: true,
        status: true,
        authorizationCode: true,
        submittedAt: true,
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
