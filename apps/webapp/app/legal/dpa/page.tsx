export default function DpaPage() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Data Processing Addendum</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Parties</h2>
          <p><strong>Controller</strong> = Customer. <strong>Processor</strong> = Vexa.ai Inc.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Subject Matter & Duration</h2>
          <p>Processing of meeting/transcript data and account metadata for the term of your subscription.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Nature & Purpose</h2>
          <p>Provision of real-time transcription and related support, security, and billing operations.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Types of Data</h2>
          <p>Meeting metadata, transcript text, timestamps, user/account identifiers; no recordings stored by default.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Subjects</h2>
          <p>Customer's authorized users and meeting participants.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Processor Obligations</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Process only on documented instructions from Controller.</li>
            <li>Confidentiality for personnel with access; least-privilege.</li>
            <li>Security measures (see Annex II).</li>
            <li>Assist with data subject requests and DPIAs.</li>
            <li>Notify without undue delay of <strong>personal data breach</strong> (aim ≤72h where feasible) with details and mitigation steps.</li>
            <li>Delete or return personal data at end of services (Controller's choice), subject to legal holds.</li>
            <li>Make available information to demonstrate compliance; reasonable audits once/year on notice.</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Sub-processing</h2>
          <p>Authorized per <a href="/legal/subprocessors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/subprocessors</a>. Processor must flow down equivalent obligations and remain liable.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">International Transfers</h2>
          <p><strong>EU SCCs (Module 2: Controller→Processor)</strong> and <strong>UK IDTA/Addendum</strong> are incorporated by reference and apply to non-EEA/UK transfers; supplementary measures as appropriate.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Liability & Indemnity</h2>
          <p>Each party's liability under this DPA is limited as per the Terms.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Annex I – Details of Processing</h2>
          <p>As described above.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Annex II – Security Measures (summary)</h2>
          <p>See <a href="/legal/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/security</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Annex III – Sub-processors</h2>
          <p>See <a href="/legal/subprocessors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/subprocessors</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>For questions about this DPA, please contact us at: <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a></p>
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
