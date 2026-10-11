"use client";

import { useState } from "react";
import { cancelAppointment } from "@/src/lib/actions";

export function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCancel() {
    setPending(true);
    const result = await cancelAppointment(appointmentId);
    setPending(false);
    if (!result.error) setDone(true);
  }

  return (
    <button className="btn btn-danger btn-small" onClick={handleCancel} disabled={pending || done}>
      {done ? "Cancelled" : pending ? "Cancelling..." : "Cancel"}
    </button>
  );
}
