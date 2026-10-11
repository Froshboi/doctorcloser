import Link from "next/link";
import { SPECIALTIES } from "@/src/lib/data";
import { HeroVisual } from "@/src/components/hero-visual";

export default function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <h1>
                Care, <span className="hero-accent">closer</span> than you think.
              </h1>
              <p>
                Search real appointment slots at clinics near you and book in minutes.
                No queue at the front desk and no phone calls required.
              </p>

              <form action="/search" className="hero-search">
                <div className="field">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input name="q" placeholder="Condition, specialty or doctor name" aria-label="Search by condition" />
                </div>
                <div className="field">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M8 14s5-4.2 5-8A5 5 0 0 0 3 6c0 3.8 5 8 5 8Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="8" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </svg>
                  <input name="location" defaultValue="Port Harcourt" aria-label="Location" />
                </div>
                <button type="submit">Search</button>
              </form>

              <div className="chip-list">
                {SPECIALTIES.slice(0, 5).map((specialty) => (
                  <Link key={specialty} href={`/search?specialty=${encodeURIComponent(specialty)}`} className="chip">
                    {specialty}
                  </Link>
                ))}
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        <div className="trust-bar">
          <div className="container trust-grid">
            <div className="trust-stat"><strong>2,400+</strong><br /><span>Verified doctors</span></div>
            <div className="trust-stat"><strong>14</strong><br /><span>States covered</span></div>
            <div className="trust-stat"><strong>18 min</strong><br /><span>Avg. time to booking</span></div>
            <div className="trust-stat"><strong>96%</strong><br /><span>Show-up rate</span></div>
          </div>
        </div>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Three steps between you and care</h2>
              <p>No referrals, no phone tag, no waiting at the reception desk.</p>
            </div>
            <div className="steps">
              <div className="step">
                <div className="num">01</div>
                <h3>Search by need</h3>
                <p>Find the right doctor by condition, specialty, clinic, or name.</p>
              </div>
              <div className="step">
                <div className="num">02</div>
                <h3>Book the real slot</h3>
                <p>Choose an available time and secure your appointment in one step.</p>
              </div>
              <div className="step">
                <div className="num">03</div>
                <h3>Get seen, same day</h3>
                <p>Receive reminders and manage your appointment from your account.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Popular specialties</h2>
            </div>
            <div className="specialty-grid">
              {SPECIALTIES.map((specialty) => (
                <Link key={specialty} href={`/search?specialty=${encodeURIComponent(specialty)}`} className="specialty-card">
                  <strong>{specialty}</strong>
                  <span>Browse available doctors</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section" style={{ borderBottom: 0 }}>
          <div className="container">
            <div className="cta-panel">
              <div>
                <h3>Run a clinic or private practice?</h3>
                <p>List your calendar, fill empty slots, and reach patients looking for care now.</p>
              </div>
              <Link href="/clinics" className="btn btn-primary">List your practice</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
