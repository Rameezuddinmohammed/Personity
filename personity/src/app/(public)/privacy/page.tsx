import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-xl font-semibold text-neutral-950 hover:text-blue-600 transition-colors"
          >
            Personity
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-neutral-200 rounded-xl p-8 md:p-12">
          <h1 className="text-3xl font-semibold text-neutral-950 mb-2">Privacy Policy</h1>
          <p className="text-sm text-neutral-600 mb-8">Last Updated: January 22, 2025</p>

          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              We respect your privacy. This policy explains how Personity collects, uses, and safeguards 
              information when you use our platform.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">1. What We Collect</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We may collect the following types of data:
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="min-w-full border border-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-950 border-b border-neutral-200">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-950 border-b border-neutral-200">
                      Examples
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700">User-provided</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      Name, email, organization, survey objectives
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700">Response data</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      Text responses, conversation transcripts
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700">Metadata</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      Timestamp, completion rate, session duration, quality scores
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700">Device data</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      Browser type, IP address, device model, user agent
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-neutral-700">AI-generated data</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      Themes, sentiment analysis, insights, quality scores
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">2. How We Use Data</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">We use collected data to:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Provide and improve the platform functionality</li>
              <li>Train and improve AI models responsibly (using anonymized data only)</li>
              <li>Detect fraud, abuse, spam, or manipulation</li>
              <li>Generate reports and insights for survey creators</li>
              <li>Provide customer support and troubleshooting</li>
              <li>Analyze product usage and performance metrics</li>
              <li>Send important service updates and notifications</li>
            </ul>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">3. Data Sharing</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>We do NOT sell personal data.</strong> We may share data with:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>
                <strong>Cloud hosting providers:</strong> Vercel (hosting), Supabase (database), 
                Azure (AI processing) - under strict data processing agreements
              </li>
              <li>
                <strong>AI model providers:</strong> Azure OpenAI (for conversation generation) - 
                data is processed securely and not used for model training by Microsoft
              </li>
              <li>
                <strong>Analytics providers:</strong> PostHog (product analytics) - anonymized usage data only
              </li>
              <li>
                <strong>Legal authorities:</strong> Only if legally required under Indian law or valid court order
              </li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              We may share anonymized or aggregated data (with no personally identifiable information) 
              for research, analytics, or product development purposes.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">4. User Rights</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>
                <strong>Access:</strong> Request a copy of your personal data
              </li>
              <li>
                <strong>Export:</strong> Download your survey data and responses in CSV or PDF format
              </li>
              <li>
                <strong>Delete:</strong> Request deletion of your account and all associated data
              </li>
              <li>
                <strong>Correct:</strong> Update inaccurate personal information
              </li>
              <li>
                <strong>Opt-out:</strong> Disable analytics tracking (where technically feasible)
              </li>
              <li>
                <strong>Withdraw consent:</strong> Stop using the platform at any time
              </li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              To exercise these rights, email us at:{' '}
              <a href="mailto:privacy@personity.app" className="text-blue-600 hover:underline">
                privacy@personity.app
              </a>
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">5. Data Retention</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">We store data only as long as necessary for:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Active surveys and ongoing research projects</li>
              <li>Legal compliance and dispute resolution (as required by Indian law)</li>
              <li>Platform performance monitoring and improvement</li>
              <li>AI model improvement (only anonymized, aggregated data)</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Creators can delete surveys and responses at any time. Deleted data is permanently removed 
              from our systems within 30 days, except where retention is required by law.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">6. Security</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>
                <strong>Encryption:</strong> Data encrypted at rest and in transit (TLS/SSL)
              </li>
              <li>
                <strong>Authentication:</strong> Secure authentication via Supabase Auth (JWT tokens)
              </li>
              <li>
                <strong>Access control:</strong> Role-based access and audit logging
              </li>
              <li>
                <strong>Rate limiting:</strong> Protection against abuse and DDoS attacks
              </li>
              <li>
                <strong>Fraud detection:</strong> Automated spam and abuse detection systems
              </li>
              <li>
                <strong>Regular updates:</strong> Security patches and vulnerability monitoring
              </li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              However, no online system is 100% secure. We cannot guarantee absolute protection from 
              all security threats. You are responsible for maintaining the confidentiality of your 
              account credentials.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">7. Children's Privacy</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              We do not knowingly collect data from individuals under 18 years of age. If you believe 
              data from a minor has been collected without proper consent, contact us immediately at{' '}
              <a href="mailto:privacy@personity.app" className="text-blue-600 hover:underline">
                privacy@personity.app
              </a>{' '}
              for immediate deletion.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">8. International Data Transfers</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Your data may be processed and stored in servers located outside India (including the 
              United States and European Union) through our service providers (Vercel, Supabase, Azure). 
              We ensure these providers comply with appropriate data protection standards and contractual 
              safeguards.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">9. Cookies & Tracking</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We use cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>
                <strong>Essential cookies:</strong> Required for authentication and platform functionality
              </li>
              <li>
                <strong>Analytics cookies:</strong> PostHog analytics to understand usage patterns
              </li>
              <li>
                <strong>Performance cookies:</strong> Monitor and improve platform performance
              </li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              You can control cookies through your browser settings, but disabling essential cookies 
              may affect platform functionality.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">10. Compliance</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We comply with applicable data protection laws, including:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Information Technology Act, 2000 (India)</li>
              <li>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</li>
              <li>Digital Personal Data Protection Act, 2023 (when enforced)</li>
            </ul>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">11. Policy Changes</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              We may update this Privacy Policy from time to time. Significant changes will be 
              communicated via email or dashboard notifications. The "Last Updated" date at the top 
              indicates when the policy was last revised. Continued use of the platform after changes 
              constitutes acceptance of the updated policy.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">12. Contact & Grievance Officer</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              For privacy inquiries, data requests, or complaints:
            </p>
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-neutral-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@personity.app" className="text-blue-600 hover:underline">
                  privacy@personity.app
                </a>
              </p>
              <p className="text-sm text-neutral-700">
                <strong>Response Time:</strong> We aim to respond within 7 business days
              </p>
            </div>
            <p className="text-neutral-700 leading-relaxed">
              As required under Indian law, we will designate a Grievance Officer once the platform 
              reaches the applicable user threshold. Contact details will be updated here.
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link
            href="/terms"
            className="text-sm text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            Terms of Service
          </Link>
          <span className="mx-3 text-neutral-400">•</span>
          <Link
            href="/"
            className="text-sm text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
