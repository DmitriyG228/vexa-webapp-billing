export default function TermsPage() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Who we are</h2>
          <p>
            Vexa.ai Inc., a Delaware corporation ("Vexa", "we"). Contact: <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Service</h2>
          <p>
            API-first bot that joins meetings to generate <strong>real-time transcripts</strong>. <strong>Not a storage or archival service.</strong>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Eligibility</h2>
          <p>
            You must be <strong>18+</strong>. <strong>Schools/children not permitted.</strong>
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Accounts</h2>
          <p>
            You are responsible for credentials, API keys, and usage in your workspace/tenant.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Subscriptions & Pricing</h2>
          <p>
            Paid subscription via Stripe. Tiered, usage-based billing per "bots" (concurrent sessions). Prices shown pre-tax unless stated. <strong>No refunds</strong> except where required by law or our explicit written commitment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Trials</h2>
          <p>
            If offered, trials auto-convert unless cancelled before end of trial.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Taxes & VAT</h2>
          <p>
            You are responsible for all applicable taxes. We collect and remit where legally required.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Fair use / AUP (summary)</h2>
          <p>
            No illegal content, malware, abuse, or rights violations. No attempting to access other customers' data. No re-identification, scraping, or spam.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Uptime & Support</h2>
          <p>
            Service is provided on an <strong>"AS IS"</strong> basis without SLA unless a separate written SLA applies. We may perform maintenance or updates at any time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data & Retention (summary)</h2>
          <p>
            Transcripts are created and <strong>kept until you delete via API/UI</strong>. We may delete at our discretion (e.g., security, abuse, capacity). <strong>You must export/backup elsewhere.</strong> We do not store recordings.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Customer Data roles</h2>
          <p>
            For meeting/transcript data, we act as <strong>processor</strong>; for account, billing, website & analytics data, we act as <strong>controller</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">IP</h2>
          <p>
            We own the Service, software and documentation. You own your data. Feedback may be used to improve the Service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Open-source code & contributions</h2>
          <p>
            Parts of the Service are developed in public under open-source licenses (e.g., Apache-2.0). Community contributions are welcome and governed by the repo license/CLA (if any). The <strong>hosted Service</strong> is provided by Vexa and may include proprietary components, telemetry, and configurations that differ from the open-source distribution. Using or self-hosting the open-source code does <strong>not</strong> grant rights to the hosted Service. Where third-party OSS is included, it is provided <strong>AS IS</strong> under its license, and to the extent permitted, we pass through any warranty disclaimers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Prohibited uses</h2>
          <p>
            Reverse-engineering; benchmarking to build a competing service without consent; circumventing technical limits; reselling without written authorization.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Suspension/Termination</h2>
          <p>
            We may suspend or terminate for breach, legal risk, or non-payment. On termination, we may delete Customer Data after a reasonable period.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Export</h2>
          <p>
            You can export transcripts via API. After termination or request, we will delete as described in the Privacy Notice/DPA.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Warranties</h2>
          <p>
            Service provided <strong>AS IS</strong>. We disclaim implied warranties to the fullest extent permitted by law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Liability</h2>
          <p>
            To the maximum extent allowed: (a) <strong>no indirect or consequential damages</strong>; (b) <strong>cap = fees paid in the 12 months</strong> before the claim. These do not limit liability that cannot be excluded by law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Indemnity</h2>
          <p>
            You will defend/indemnify us from third-party claims arising from your content or misuse.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Governing Law & Venue</h2>
          <p>
            <strong>Delaware, USA</strong> law; exclusive jurisdiction and venue in Delaware state or federal courts.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Changes</h2>
          <p>
            We may update these Terms; continued use means acceptance. We'll post the effective date and a summary of changes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Entire Agreement</h2>
          <p>
            These Terms + order forms + DPA + policies linked herein.
          </p>
        </section>
      </div>
    </div>
  )
}
