"use client";

import { useState } from "react";
import { createAppointment } from "@/src/lib/actions";
import { formatDateTime } from "@/src/lib/data";

export function BookAppointmentForm({ doctorId, slots }: { doctorId: string; slots: { id: string; startsAt: Date }[] }) {
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [pending, setPending] = useState(false);

  const handleSubmit = async () => {
    if (!selectedSlotId) return;
    setPending(true);
    setError("");

    const result = await createAppointment({ doctorId, slotId: selectedSlotId });
    setPending(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setStatus("Appointment created successfully.");
    setSelectedSlotId("");
  };

  return (
    <>
      <div className="date-row" style={{ marginTop: 18 }}>
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            className={`date-pill ${selectedSlotId === slot.id ? "active" : ""}`}
            onClick={() => setSelectedSlotId(slot.id)}
          >
            <span>{new Date(slot.startsAt).toLocaleDateString("en-NG", { weekday: "short" })}</span>
            <strong>{new Date(slot.startsAt).getDate()}</strong>
          </button>
        ))}
      </div>

      {selectedSlotId && (
        <div className="appointment-footer" style={{ marginTop: 16 }}>
          <span className="appointment-status">
            {formatDateTime(new Date(slots.find((slot) => slot.id === selectedSlotId)!.startsAt))}
          </span>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={pending}>
            {pending ? "Booking..." : "Confirm appointment"}
          </button>
        </div>
      )}

      {error && <p className="form-error" role="alert">{error}</p>}
      {status && <p className="appointment-status success">{status}</p>}
    </>
  );
}
