import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";
import { formatDateTime } from "@/src/lib/data";
import { CancelAppointmentButton } from "@/src/components/cancel-appointment-button";

export default async function DashboardPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <main className="container dashboard">
        <section className="dashboard-panel">
          <div className="section-head">
            <h2>Appointments are in demo mode</h2>
            <p>Configure a database to sign in and manage saved appointments.</p>
          </div>
          <a className="btn btn-primary" href="/search">Find a doctor</a>
        </section>
      </main>
    );
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const appointments = await prisma.appointment.findMany({
    where: { userId: session.user.id },
    include: { doctor: true, slot: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="container dashboard">
      <div className="dashboard-grid">
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a className="active" href="/dashboard">My appointments</a>
          <a href="/search">Book another appointment</a>
        </nav>

        <section className="dashboard-panel">
          <div className="section-head">
            <h2>Your appointments</h2>
            <p>Manage upcoming visits and cancellations from one place.</p>
          </div>

          {appointments.length === 0 ? (
            <div className="empty-state">You have no appointments yet. <a href="/search">Book your first visit.</a></div>
          ) : (
            <div className="appointment-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div>
                    <strong>{appointment.doctor.name}</strong>
                    <small>{appointment.doctor.specialty} · {appointment.doctor.clinicName}</small>
                    <br />
                    <small>{appointment.slot ? formatDateTime(new Date(appointment.slot.startsAt)) : "Time unavailable"}</small>
                  </div>

                  <div>
                    <span className="status-badge">{appointment.status}</span>
                    {appointment.status !== "CANCELLED" && (
                      <div style={{ marginTop: 10 }}>
                        <CancelAppointmentButton appointmentId={appointment.id} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
