export default function SecurityPage() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Security Overview</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Model</h2>
          <p>Single-tenant logic per workspace; multi-tenant infrastructure on IaaS.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Regions</h2>
          <p>Primary: <strong>Frankfurt, Germany (Vultr)</strong>. We may deploy in other Vultr regions upon request or for capacity; we'll reflect this on <a href="/legal/subprocessors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/subprocessors</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data at rest</h2>
          <p>Stored on encrypted volumes provided by our IaaS. We do <strong>not</strong> offer end-to-end encryption.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data in transit</h2>
          <p>HTTPS/TLS for all public endpoints.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Access controls</h2>
          <p>Minimal production access; <strong>MFA required</strong>; role-based; access limited to operational need and logged.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Secure development</h2>
          <p>The codebase is <strong>open-source</strong> and accepts community contributions. We use code review, CI checks, and dependency scanning before deployment. Security issues can be reported via <strong>/.well-known/security.txt</strong>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data minimization</h2>
          <p>No recording storage by default. Transcripts kept until you delete. System logs avoid sensitive payloads where feasible.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Backups</h2>
          <p>Infrastructure resilience (e.g., replicas) only. <strong>No customer-restorable backups of transcripts</strong>; you must export/retain copies.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Deletion</h2>
          <p>API/UI deletion purges transcripts from active systems; residual copies may persist briefly in logs or caches until overwritten.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Incident response</h2>
          <p>24/7 monitoring; triage, containment, and customer comms. Breach notices per DPA/Privacy.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Vulnerability disclosure</h2>
          <p>Email <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a> or use /.well-known/security.txt. No bug-bounty yet.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Employee & devices</h2>
          <p>Minimal staff; security training; patched OS; full-disk encryption; least-privilege.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Compliance</h2>
          <p>No certification claims. We follow reasonable industry practices appropriate for an early-stage SaaS.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>
            For security-related questions, please contact us at: <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a>
          </p>
          <div className="mt-4">
            <p className="font-medium">Address:</p>
            <p>
              Vexa.ai Inc.<br />
              16192 Coastal Highway<br />
              Lewes, DE 19958<br />
              Sussex County, DE
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
