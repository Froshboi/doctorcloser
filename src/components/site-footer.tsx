import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>DoctorCloser · Built for better access to care.</span>
        <div className="footer-links">
          <Link href="/clinics">For clinics</Link>
          <Link href="/dashboard">Appointments</Link>
          <Link href="/privacy">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
