export default function CookiesPage() {
  return (
    <div className="py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Overview</h2>
          <p>
            We use essential cookies and (if consented) analytics cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Consent</h2>
          <p>
            A banner lets you <strong>accept/deny</strong> analytics cookies at any time. Manage preferences: [/cookie-preferences] (link your CMP).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Categories</h2>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Essential (no opt-out)</h3>
            <p>auth/session, CSRF, load balancing.</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Analytics (opt-in where required)</h3>
            <p>Google Analytics (GA4), Umami.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Examples</h2>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Google Analytics</h3>
            <p><code>_ga</code>, <code>_ga_*</code>, <code>_gid</code>, <code>_gat</code> (lifetimes per Google).</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium">Umami</h3>
            <p>can be <strong>cookieless</strong>; if cookies are enabled, name/lifetime per your setup.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Third-party recipients</h2>
          <p>
            See <a href="/legal/subprocessors" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/legal/subprocessors</a>.
          </p>
        </section>
      </div>
    </div>
  )
}
