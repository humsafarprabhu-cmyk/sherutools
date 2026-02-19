import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions | SheruTools',
  description: 'Terms and conditions for using SheruTools services.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-white/40 mb-10">Last updated: February 19, 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SheruTools (&quot;sherutools.com&quot;, &quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;), you agree to be bound by these Terms &amp; Conditions. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>
              SheruTools provides a collection of free and premium online tools including AI-powered utilities, document generators, developer tools, design tools, and other productivity software accessible via web browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p>
              Some features may require account creation. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You must provide accurate information and notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Free and Premium Services</h2>
            <p>
              SheruTools offers both free and premium tiers. Free tools may have usage limits (e.g., daily usage caps). Premium features are available through paid subscriptions or one-time purchases processed via our payment partner, Lemon Squeezy. All prices are displayed at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Payments &amp; Refunds</h2>
            <p>
              Payments are processed securely through Lemon Squeezy. Subscription plans renew automatically unless cancelled before the renewal date. You may cancel your subscription at any time through your account settings or by contacting us. Refund requests are handled on a case-by-case basis within 14 days of purchase — contact us at support@sherutools.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, decompile, or hack the Service</li>
              <li>Overload our servers with automated requests or abuse free tier limits</li>
              <li>Upload malicious content or attempt to compromise other users</li>
              <li>Resell or redistribute premium features without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p>
              Content you create using our tools belongs to you. The SheruTools platform, branding, design, and code remain our intellectual property. You may not copy, modify, or distribute our platform without permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. AI-Generated Content</h2>
            <p>
              Some tools use AI (including OpenAI models) to generate content. AI-generated outputs are provided as-is. We do not guarantee the accuracy, originality, or suitability of AI-generated content. You are responsible for reviewing and using generated content appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Privacy &amp; Data</h2>
            <p>
              Your privacy matters. Please review our <a href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">Privacy Policy</a> for details on how we collect, use, and protect your data. Most of our tools process data client-side (in your browser) and do not store your files on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Limitation of Liability</h2>
            <p>
              SheruTools is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the preceding 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Service Availability</h2>
            <p>
              We strive for high uptime but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will update the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact</h2>
            <p>
              For questions about these terms, contact us at{' '}
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
