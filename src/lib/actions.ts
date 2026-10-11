"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

const appointmentSchema = z.object({
  doctorId: z.string().min(1),
  slotId: z.string().min(1),
});

export async function createAppointment(input: unknown) {
  if (!process.env.DATABASE_URL) {
    return { error: "Appointment booking is unavailable until a database is configured." };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { error: "You need to sign in before booking." };

  const parsed = appointmentSchema.safeParse(input);
  if (!parsed.success) return { error: "The appointment details are invalid." };

  const slot = await prisma.doctorSlot.findUnique({
    where: { id: parsed.data.slotId },
    include: { doctor: true },
  });

  if (!slot || slot.doctorId !== parsed.data.doctorId || slot.status !== "AVAILABLE") {
    return { error: "That appointment slot is no longer available." };
  }

  const existing = await prisma.appointment.findFirst({
    where: { userId, slotId: slot.id, status: { not: "CANCELLED" } },
  });

  if (existing) return { error: "You already have an appointment for this time." };

  await prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.create({
      data: {
        userId,
        doctorId: slot.doctorId,
        slotId: slot.id,
        status: "PENDING",
      },
    });

    await tx.doctorSlot.update({
      where: { id: slot.id },
      data: { status: "BOOKED" },
    });

    await tx.appointment.update({
      where: { id: appointment.id },
      data: { status: "CONFIRMED" },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/doctor/${parsed.data.doctorId}`);
  return { success: true };
}

export async function cancelAppointment(appointmentId: string) {
  if (!process.env.DATABASE_URL) {
    return { error: "Appointment management is unavailable until a database is configured." };
  }

  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in required." };

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, userId: session.user.id },
    include: { slot: true },
  });

  if (!appointment) return { error: "Appointment not found." };

  await prisma.$transaction(async (tx) => {
    if (appointment.slotId) {
      await tx.doctorSlot.update({
        where: { id: appointment.slotId },
        data: { status: "AVAILABLE" },
      });
    }

    await tx.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath(`/doctor/${appointment.doctorId}`);
  return { success: true };
}
