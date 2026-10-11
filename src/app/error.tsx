"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="container" style={{ textAlign: "center", padding: "120px 0" }}>
      <h1>Something went wrong.</h1>
      <p>Please try again.</p>
      <button className="btn btn-primary" onClick={() => reset()}>Try again</button>
    </main>
  );
}
