export default function SubprocessorsPage() {
  return (
    <div className="py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Sub-processors</h1>
          <p className="text-muted-foreground">Last updated: [YYYY-MM-DD]</p>
        </div>

        <section className="space-y-4">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Vendor</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Purpose</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Region</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Data</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Transfer Mechanism</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Vultr</td>
                  <td className="border border-gray-300 px-4 py-2">IaaS compute/networking</td>
                  <td className="border border-gray-300 px-4 py-2">Primary <strong>Frankfurt, DE</strong>; may use other Vultr regions</td>
                  <td className="border border-gray-300 px-4 py-2">transcripts (at rest), logs, metadata</td>
                  <td className="border border-gray-300 px-4 py-2">EEA hosting; if moved cross-border: SCCs</td>
                  <td className="border border-gray-300 px-4 py-2">Encrypted disks; no E2EE</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Stripe</td>
                  <td className="border border-gray-300 px-4 py-2">Payments, invoicing, tax</td>
                  <td className="border border-gray-300 px-4 py-2">US/EU</td>
                  <td className="border border-gray-300 px-4 py-2">billing PII, payment tokens</td>
                  <td className="border border-gray-300 px-4 py-2">SCCs + Stripe safeguards</td>
                  <td className="border border-gray-300 px-4 py-2">PCI DSS Level 1</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Google Analytics (GA4)</td>
                  <td className="border border-gray-300 px-4 py-2">Web analytics</td>
                  <td className="border border-gray-300 px-4 py-2">Global</td>
                  <td className="border border-gray-300 px-4 py-2">cookie/device IDs, events</td>
                  <td className="border border-gray-300 px-4 py-2">SCCs + IP masking</td>
                  <td className="border border-gray-300 px-4 py-2">Consent-based</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Umami</td>
                  <td className="border border-gray-300 px-4 py-2">Web analytics</td>
                  <td className="border border-gray-300 px-4 py-2">Self-hosted in DE *(or note cloud region)*</td>
                  <td className="border border-gray-300 px-4 py-2">page events, minimal IDs</td>
                  <td className="border border-gray-300 px-4 py-2">N/A if self-hosted in EEA</td>
                  <td className="border border-gray-300 px-4 py-2">Prefer cookieless</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-medium">Email provider [TBD]</td>
                  <td className="border border-gray-300 px-4 py-2">Transactional email</td>
                  <td className="border border-gray-300 px-4 py-2">[Region]</td>
                  <td className="border border-gray-300 px-4 py-2">name, email, notices</td>
                  <td className="border border-gray-300 px-4 py-2">SCCs if outside EEA</td>
                  <td className="border border-gray-300 px-4 py-2">e.g., Postmark/SES/SendGrid</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">Error monitoring [TBD]</td>
                  <td className="border border-gray-300 px-4 py-2">Error tracking (optional)</td>
                  <td className="border border-gray-300 px-4 py-2">[Region]</td>
                  <td className="border border-gray-300 px-4 py-2">stack traces, metadata</td>
                  <td className="border border-gray-300 px-4 py-2">SCCs if outside EEA</td>
                  <td className="border border-gray-300 px-4 py-2">e.g., Sentry/Rollbar</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Change procedure</h2>
          <p>
            We will post updates here <strong>≥14 days</strong> before adding/replacing a sub-processor (except urgent replacements for security/legal reasons, where we'll notify as soon as practicable). You may object on reasonable grounds; if unresolved, you may terminate affected services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>
            For questions about our sub-processors, please contact us at: <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a>
          </p>
        </section>
      </div>
    </div>
  )
}
