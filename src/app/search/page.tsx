import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { getDemoDoctors, SPECIALTIES, formatPrice } from "@/src/lib/data";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; q?: string; location?: string; }>;
}) {
  const params = await searchParams;
  const specialty = params.specialty ?? "all";
  const query = params.q?.trim() ?? "";
  const location = params.location?.trim() ?? "Port Harcourt";

  const doctors = process.env.DATABASE_URL
    ? await prisma.doctor.findMany({
        where: specialty === "all"
          ? { city: { contains: location } }
          : { specialty, city: { contains: location } },
        include: {
          slots: {
            where: { status: "AVAILABLE" },
            orderBy: { startsAt: "asc" },
            take: 3,
          },
        },
        orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      })
    : getDemoDoctors().filter((doctor) => {
        const matchesCity = doctor.city.toLowerCase().includes(location.toLowerCase());
        return matchesCity && (specialty === "all" || doctor.specialty === specialty);
      });

  const filteredDoctors = doctors.filter((doctor) => {
    if (!query) return true;
    const haystack = `${doctor.name} ${doctor.specialty} ${doctor.clinicName}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <main>
      <div className="filter-bar">
        <div className="container filter-list">
          <Link className={`filter-chip ${specialty === "all" ? "active" : ""}`} href="/search">All specialties</Link>
          {SPECIALTIES.map((item) => (
            <Link key={item} className={`filter-chip ${specialty === item ? "active" : ""}`} href={`/search?specialty=${encodeURIComponent(item)}&location=${encodeURIComponent(location)}`}>
              {item}
            </Link>
          ))}
          <select className="filter-select" aria-label="Sort doctors" defaultValue="rating">
            <option value="rating">Highest rated</option>
            <option value="soonest">Soonest available</option>
          </select>
        </div>
      </div>

      <div className="container search-layout">
        <section>
          <div className="section-head" style={{ marginBottom: 18 }}>
            <h2>{location}: {filteredDoctors.length} doctor{filteredDoctors.length === 1 ? "" : "s"}</h2>
            <p>Choose a practitioner and reserve an appointment time.</p>
          </div>

          {filteredDoctors.length === 0 ? (
            <div className="empty-state">No doctors match your search. Try another specialty or location.</div>
          ) : (
            <div className="doctor-list">
              {filteredDoctors.map((doctor) => (
                <article key={doctor.id} className="doctor-card">
                  <div className="avatar" style={{ background: doctor.color }}>{doctor.initials}</div>

                  <div className="doctor-main">
                    <h3><Link href={`/doctor/${doctor.id}`}>{doctor.name}</Link></h3>
                    <div className="doctor-meta">
                      <span>{doctor.specialty}</span>
                      <span>·</span>
                      <span>{doctor.clinicName}</span>
                      <span>·</span>
                      <span>{doctor.rating.toFixed(1)} ({doctor.reviewCount} reviews)</span>
                    </div>
                    <div className="doctor-tags">New patient appointments · Available soon</div>
                  </div>

                  <div className="doctor-side">
                    <div className="price">{formatPrice(doctor.price)}<br /><small>consultation</small></div>
                    <span className="next-slot">{doctor.slots[0] ? new Date(doctor.slots[0].startsAt).toLocaleString("en-NG", { weekday: "short", hour: "numeric", minute: "2-digit" }) : "No slots"}</span>
                    <Link href={`/doctor/${doctor.id}`} className="btn btn-primary btn-small">Book</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside>
          <div className="side-card">
            <h3>Booking in {location}</h3>
            <div className="map" aria-label="Location map placeholder" />
            <p>Appointments appear live from each clinic calendar and are only held after confirmation.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
