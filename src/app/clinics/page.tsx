export default function ClinicsPage() {
  return (
    <main>
      <section className="page-header">
        <div className="container">
          <h1>Fill more of your calendar, with less admin.</h1>
          <p>List your practice on DoctorCloser and reach patients who are searching for care right now.</p>
          <a className="btn btn-primary" href="/signup">List your practice</a>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Everything your clinic needs</h2>
          </div>
          <div className="specialty-grid">
            <div className="specialty-card"><strong>Live calendar management</strong><span>Create and update appointment times with ease.</span></div>
            <div className="specialty-card"><strong>Fewer no-shows</strong><span>Send appointment reminders automatically.</span></div>
            <div className="specialty-card"><strong>Patient verification</strong><span>Help protect your clinic from invalid bookings.</span></div>
            <div className="specialty-card"><strong>Clinic analytics</strong><span>See which services are filling up fastest.</span></div>
          </div>
        </div>
      </section>
    </main>
  );
}
