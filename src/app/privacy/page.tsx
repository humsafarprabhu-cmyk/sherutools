import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | SheruTools',
  description: 'Privacy policy for SheruTools - how we handle your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 mb-10">Last updated: February 19, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Overview</h2>
            <p>
              SheruTools (&quot;sherutools.com&quot;, &quot;we&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Data We Collect</h2>
            <p className="font-medium text-white mb-2">Client-Side Processing</p>
            <p>
              Most SheruTools operate entirely in your browser. Files you upload for processing (images, PDFs, text) are processed locally on your device and are <strong className="text-white">never sent to or stored on our servers</strong>.
            </p>
            <p className="font-medium text-white mb-2 mt-4">AI-Powered Tools</p>
            <p>
              Tools that use AI (email writer, content rewriter, code explainer, etc.) send your input text to our API, which forwards it to OpenAI for processing. We do not store your input or the AI-generated output after the response is delivered.
            </p>
            <p className="font-medium text-white mb-2 mt-4">Analytics</p>
            <p>
              We use Google Analytics (GA4) to collect anonymous usage data such as page views, tool usage frequency, browser type, and geographic region. This data contains no personally identifiable information.
            </p>
            <p className="font-medium text-white mb-2 mt-4">Account Data</p>
            <p>
              If you create an account or purchase a premium plan, we collect your email address and payment information. Payments are processed by Lemon Squeezy — we never see or store your full credit card details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and improve our tools and services</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (receipts, account updates)</li>
              <li>To analyze aggregate usage patterns and improve user experience</li>
              <li>To respond to support requests</li>
            </ul>
            <p className="mt-3">We do <strong className="text-white">not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies &amp; Local Storage</h2>
            <p>
              We use localStorage to track free-tier usage limits (e.g., daily AI tool usage count) and save user preferences (theme, settings). We use cookies only for essential functionality like authentication sessions. No third-party advertising cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white">OpenAI</strong> — AI text generation (subject to <a href="https://openai.com/policies/privacy-policy" className="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">OpenAI&apos;s Privacy Policy</a>)</li>
              <li><strong className="text-white">Lemon Squeezy</strong> — Payment processing (subject to <a href="https://www.lemonsqueezy.com/privacy" className="text-indigo-400 hover:text-indigo-300 underline" target="_blank" rel="noopener noreferrer">Lemon Squeezy&apos;s Privacy Policy</a>)</li>
              <li><strong className="text-white">Google Analytics</strong> — Anonymous usage analytics</li>
              <li><strong className="text-white">Vercel</strong> — Hosting and content delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Retention</h2>
            <p>
              We retain account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days. Anonymous analytics data may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw consent for data processing at any time</li>
              <li>Export your data in a portable format</li>
              <li>Opt out of analytics tracking</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at support@sherutools.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Security</h2>
            <p>
              We implement industry-standard security measures including HTTPS encryption, secure authentication, and regular security reviews. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>
              SheruTools is not intended for children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. Changes will be reflected by the &quot;Last updated&quot; date above. Continued use of the Service after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact</h2>
            <p>
              For privacy-related questions, contact us at{' '}
              <a href="mailto:support@sherutools.com" className="text-indigo-400 hover:text-indigo-300 underline">
                support@sherutools.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
