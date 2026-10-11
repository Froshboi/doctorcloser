import Link from "next/link";
import { auth } from "@/src/lib/auth";
import { SignOutButton } from "@/src/components/signout-button";

export async function SiteHeader() {
  const session = process.env.DATABASE_URL ? await auth() : null;

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand" aria-label="DoctorCloser home">
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M12 6C7.5 10 7.5 22 12 26" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" />
            <path d="M20 6C24.5 10 24.5 22 20 26" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" />
            <path d="M12.5 16H14.3L15.8 10.8L17.6 21.2L19 16H19.5" stroke="var(--orange)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Doctor<span className="brand-accent">Closer</span></span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/search">Find a doctor</Link>
          <Link href="/clinics">For clinics</Link>
          <Link href="/dashboard">My appointments</Link>
        </nav>

        <div className="nav-actions">
          {session?.user ? (
            <div className="nav-user">
              <span className="nav-user-name">{session.user.name ?? "Patient"}</span>
              <Link className="btn btn-secondary btn-small" href="/dashboard">Dashboard</Link>
              <SignOutButton />
            </div>
          ) : (
            <>
              <Link className="btn btn-secondary btn-small" href="/login">Sign in</Link>
              <Link className="btn btn-primary btn-small" href="/signup">Create account</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
