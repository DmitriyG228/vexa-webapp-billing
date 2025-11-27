export default function PrivacyPage() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Privacy Notice</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Controller</h2>
          <p>
            Vexa.ai Inc. (for account, billing, website & analytics). <strong>Processor.</strong> Vexa.ai Inc. (for meeting/transcript data on your instructions).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Contact</h2>
          <p>
            <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a>.
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

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">EU contacts & authority</h2>
          <p>
            If Vexa has an <strong>EU establishment</strong> (e.g., main establishment in Portugal), the lead supervisory authority is <strong>CNPD (Portugal)</strong> under GDPR's one-stop-shop. <strong>If Vexa has no EU establishment</strong>, the one-stop-shop does <strong>not</strong> apply; we will appoint an <strong>EU Article 27 representative</strong> (with address listed here), and relevant EU/EEA authorities remain competent.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">What we process</h2>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Account</h3>
            <p>name, email, company, billing info, plan, usage metrics.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Meetings (processor)</h3>
            <p>meeting metadata, transcript text, speaker labels (if provided), timestamps.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Diagnostics</h3>
            <p>service logs/IDs (no audio/video content stored).</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Website/analytics</h3>
            <p>cookie identifiers, pages, device, referrers.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Purposes & Legal Bases</h2>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Provide Service & support</h3>
            <p>(<strong>contract</strong>).</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Security/fraud prevention</h3>
            <p>(<strong>legitimate interests</strong>).</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Billing & compliance</h3>
            <p>(<strong>legal obligation/contract</strong>).</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Analytics & marketing cookies</h3>
            <p>(<strong>consent</strong> where required).</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Retention</h2>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Transcripts</h3>
            <p>kept <strong>until you delete</strong> (you control deletion); <strong>not backed up for your restoration</strong>; we may delete for safety/abuse/space.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Account & billing</h3>
            <p>as long as you have an account + statutory periods.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Logs/analytics</h3>
            <p>short operational windows or as required by law.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Children</h2>
          <p>
            Service is <strong>18+</strong>. We do not knowingly process children's data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">International Transfers</h2>
          <p>
            Primary hosting: <strong>Frankfurt, DE</strong>; may use other <strong>Vultr</strong> regions. Where vendors are outside the EEA/UK, we rely on <strong>SCCs</strong> and supplementary measures.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Your Rights (EEA/UK)</h2>
          <p>Access, rectify, erase, restrict, object, portability, and withdraw consent. Contact: <a href="mailto:info@vexa.ai" className="text-blue-600 hover:underline">info@vexa.ai</a>. You may lodge a complaint with a supervisory authority.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Processors/Sub-processors</h2>
          <p>See <a href="/legal/subprocessors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/subprocessors</a>.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Do Not Sell/Share (US)</h2>
          <p>We do not sell personal information. State privacy rights honored as applicable.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Data Security</h2>
          <p>See <a href="/legal/security" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/security</a>.</p>
        </section>
      </div>
    </div>
  )
}
