import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-3xl font-semibold text-neutral-950 mb-2">Terms of Service</h1>
          <p className="text-sm text-neutral-600 mb-8">Last Updated: January 22, 2025</p>

          <div className="prose prose-neutral max-w-none">
            <p className="text-neutral-700 leading-relaxed mb-6">
              Welcome to Personity ("Platform", "we", "us", "our"). By accessing or using our platform, 
              you agree to these Terms of Service. If you do not agree, please do not use the platform.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">1. About the Platform</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Personity allows creators to launch AI-powered conversational research to gather insights 
              from respondents. The system conducts adaptive interviews through dynamic conversations and 
              generates analytical reports based on responses.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-6">
              The platform is not a replacement for professional research, legal advice, medical assessment, 
              or financial guidance.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">2. Eligibility</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">You must:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Be at least 18 years old, or the minimum age required in your jurisdiction</li>
              <li>Have authority to represent a company if signing up on its behalf</li>
              <li>Agree to comply with all applicable laws and regulations in India and your jurisdiction</li>
            </ul>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">3. User Responsibilities</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>Creators ("Users")</strong> are responsible for:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
              <li>The objective and purpose of each AI-powered survey</li>
              <li>Ensuring the legality of questions being asked</li>
              <li>Providing accurate descriptions of how responses will be used</li>
              <li>Obtaining necessary user consents when required by law</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              <strong>Respondents</strong> are responsible for providing truthful responses and must not 
              submit abusive, defamatory, illegal, or private information belonging to others.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">4. AI Conversations & Limitations</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              Our system generates questions dynamically using AI models (Azure OpenAI GPT-4o). You acknowledge that:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Questions may vary between respondents based on their answers</li>
              <li>We do not guarantee 100% accuracy of AI-generated insights</li>
              <li>Users must not rely solely on AI outputs for decisions involving risk (legal, medical, financial, or psychological decisions)</li>
              <li>AI responses are generated based on patterns and may not reflect human judgment</li>
            </ul>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">5. Data & Storage</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              All data is handled in accordance with our Privacy Policy. We may store conversation transcripts, 
              response metadata, and AI-generated insights for the purpose of:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
              <li>Improving insights accuracy</li>
              <li>Personalization and adaptive questioning</li>
              <li>Preventing misuse, fraud, or abuse</li>
              <li>Product improvement and feature development</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Creators may export or delete responses at any time through their dashboard.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">6. Prohibited Use</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">Users may NOT use the platform to:</p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
              <li>Collect data from minors without verifiable parental consent</li>
              <li>Conduct medical diagnosis or psychological assessment</li>
              <li>Collect sensitive personal information (Aadhaar numbers, financial data, government IDs)</li>
              <li>Discriminate on the basis of race, gender, religion, caste, or other protected attributes</li>
              <li>Generate misinformation, manipulative content, or spam</li>
              <li>Violate the Information Technology Act, 2000 or other applicable Indian laws</li>
            </ul>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">7. Intellectual Property</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>You own:</strong> The survey objectives, questions, and raw response data you collect.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-4">
              <strong>We own:</strong> The platform, AI logic, algorithms, UX components, and insight generation framework.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-6">
              You receive a license to use the platform, not ownership of the underlying technology.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">8. Billing & Subscription</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Paid plans (when available) will be billed as stated during checkout. Refunds are evaluated 
              on a case-by-case basis. We may change pricing with 30 days' prior notice.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">9. Termination</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              We may suspend or terminate accounts that violate:
            </p>
            <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-4">
              <li>Applicable laws (including Indian IT Act, 2000)</li>
              <li>These Terms of Service</li>
              <li>Data misuse or unethical research practices</li>
            </ul>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Users may delete their accounts at any time through the dashboard settings.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">10. Disclaimer & Limitation of Liability</h2>
            <p className="text-neutral-700 leading-relaxed mb-4">
              The platform is provided "AS IS" with no warranties, express or implied. We are not liable 
              for any decisions, consequences, or damages arising from insights generated via AI. You use 
              the platform at your own risk.
            </p>
            <p className="text-neutral-700 leading-relaxed mb-6">
              Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">11. Governing Law & Jurisdiction</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              These Terms shall be governed by and construed in accordance with the laws of India. 
              Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of 
              the courts in Hyderabad, Telangana, India.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">12. Changes to Terms</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              We may update these Terms from time to time. Significant changes will be communicated via 
              email or dashboard notifications. Continued use of the platform after changes constitutes 
              acceptance of the updated Terms.
            </p>

            <h2 className="text-xl font-semibold text-neutral-950 mt-8 mb-4">13. Contact</h2>
            <p className="text-neutral-700 leading-relaxed mb-6">
              For questions about these Terms, contact us at:{' '}
              <a href="mailto:support@personity.app" className="text-blue-600 hover:underline">
                support@personity.app
              </a>
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link
            href="/privacy"
            className="text-sm text-neutral-600 hover:text-neutral-950 transition-colors"
          >
            Privacy Policy
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
