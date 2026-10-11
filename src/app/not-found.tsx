import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container" style={{ textAlign: "center", padding: "120px 0" }}>
      <h1>404</h1>
      <p>This page does not exist.</p>
      <Link className="btn btn-primary" href="/">Return home</Link>
    </main>
  );
}
