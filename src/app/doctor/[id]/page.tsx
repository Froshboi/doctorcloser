import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { formatPrice, getDemoDoctors } from "@/src/lib/data";
import { BookAppointmentForm } from "@/src/components/book-appointment-form";

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const databaseConfigured = Boolean(process.env.DATABASE_URL);
  const doctor = databaseConfigured
    ? await prisma.doctor.findUnique({
        where: { id },
        include: {
          slots: {
            where: { status: "AVAILABLE" },
            orderBy: { startsAt: "asc" },
          },
        },
      })
    : getDemoDoctors().find((record) => record.id === id);

  if (!doctor) notFound();

  return (
    <main className="profile">
      <Link href="/search" className="profile-back">← Back to search</Link>

      <div className="profile-head">
        <div className="avatar" style={{ background: doctor.color }}>{doctor.initials}</div>
        <div>
          <h1>{doctor.name}</h1>
          <div className="profile-meta">
            <span>{doctor.specialty}</span>
            <span>·</span>
            <span>{doctor.clinicName}</span>
            <span>·</span>
            <span>{doctor.rating.toFixed(1)} ({doctor.reviewCount} reviews)</span>
          </div>
        </div>
      </div>

      <section className="profile-section">
        <h2>About</h2>
        <p>{doctor.bio}</p>
      </section>

      <section className="profile-section">
        <h2>Book an appointment — {formatPrice(doctor.price)}</h2>
        {!databaseConfigured ? (
          <div className="empty-state">Appointment booking is in demo mode. Configure a database to accept and save bookings.</div>
        ) : doctor.slots.length === 0 ? (
          <div className="empty-state">No appointment slots are currently available. Please check again soon.</div>
        ) : (
          <BookAppointmentForm doctorId={doctor.id} slots={doctor.slots} />
        )}
      </section>
    </main>
  );
}
