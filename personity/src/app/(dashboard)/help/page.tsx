'use client';

import { useState } from 'react';
import { Search, Book, CreditCard, MessageSquare, Settings, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: Book },
  { id: 'surveys', name: 'Creating Surveys', icon: MessageSquare },
  { id: 'billing', name: 'Billing & Plans', icon: CreditCard },
  { id: 'account', name: 'Account Settings', icon: Settings },
  { id: 'security', name: 'Security & Privacy', icon: Shield },
  { id: 'troubleshooting', name: 'Troubleshooting', icon: HelpCircle },
];

const articles: Article[] = [
  // Getting Started
  {
    id: 'what-is-personity',
    title: 'What is Personity?',
    category: 'getting-started',
    content: 'Personity is an AI-powered conversational research platform that conducts adaptive interviews at scale. Unlike traditional surveys, Personity uses GPT-4o to have natural conversations with respondents, asking follow-up questions and diving deeper into responses to gather interview-depth insights.',
    tags: ['introduction', 'overview', 'basics'],
  },
  {
    id: 'create-first-survey',
    title: 'How do I create my first survey?',
    category: 'getting-started',
    content: '1. Click "Create Survey" from your dashboard\n2. Choose your survey mode (Product Discovery, Feedback, or Exploratory)\n3. Enter your research objective\n4. Add 3-5 key topics you want to explore\n5. Optionally add context about your product/audience\n6. Review and publish\n\nThe entire process takes under 5 minutes!',
    tags: ['survey', 'create', 'setup', 'beginner'],
  },
  {
    id: 'test-mode',
    title: 'What is Test Mode?',
    category: 'getting-started',
    content: 'Test Mode allows you to preview how your survey will work before sharing it with real respondents. You can have a conversation with the AI to ensure it asks the right questions and follows your research objective. Test conversations don\'t count toward your response limit.',
    tags: ['test', 'preview', 'demo'],
  },

  // Surveys
  {
    id: 'survey-modes',
    title: 'What are the different survey modes?',
    category: 'surveys',
    content: '**Product Discovery**: Best for understanding user needs, pain points, and feature requests. The AI probes deeply into problems and solutions.\n\n**Feedback & Satisfaction**: Ideal for gathering feedback on existing products or measuring satisfaction. Focuses on experiences and improvements.\n\n**Exploratory General**: Open-ended research for broad topics. The AI adapts to wherever the conversation naturally flows.',
    tags: ['modes', 'types', 'discovery', 'feedback'],
  },
  {
    id: 'share-survey',
    title: 'How do I share my survey?',
    category: 'surveys',
    content: 'After creating your survey, you\'ll get a unique short URL (e.g., personity.so/s/abc123). You can:\n\n1. Copy the link and share it anywhere\n2. Embed it in emails or messages\n3. Add it to your website\n4. Share on social media\n\nRespondents can pause and resume conversations at any time.',
    tags: ['share', 'distribute', 'link', 'url'],
  },
  {
    id: 'response-analysis',
    title: 'How does response analysis work?',
    category: 'surveys',
    content: 'After each conversation completes, Personity automatically analyzes it using AI to extract:\n\n- **Summary**: Key points from the conversation\n- **Themes**: Main topics discussed\n- **Sentiment**: Overall tone (positive/neutral/negative)\n- **Pain Points**: Problems mentioned\n- **Opportunities**: Ideas and suggestions\n- **Top Quotes**: Notable statements\n\nYou can view individual analyses or aggregate insights across all responses.',
    tags: ['analysis', 'insights', 'results', 'data'],
  },
  {
    id: 'export-data',
    title: 'Can I export my survey data?',
    category: 'surveys',
    content: 'Yes! You can export your survey data in two formats:\n\n**PDF Report**: Beautiful, formatted report with all insights, themes, and quotes. Perfect for sharing with stakeholders.\n\n**CSV Export**: Raw data including all conversations, timestamps, and analysis. Great for further analysis in Excel or other tools.\n\nBoth exports are available from the survey insights page.',
    tags: ['export', 'download', 'pdf', 'csv', 'report'],
  },

  // Billing & Plans
  {
    id: 'pricing-plans',
    title: 'What are the pricing plans?',
    category: 'billing',
    content: '**Free**: 50 responses/month - Perfect for trying Personity\n\n**Starter (₹2,499/mo)**: 500 responses/month - For small teams (50% beta discount)\n\n**Pro (₹7,499/mo)**: 2,000 responses/month - For growing teams (50% beta discount)\n\n**Enterprise**: Custom pricing for 2,000+ responses/month with dedicated support\n\nAll plans include full features, PDF/CSV export, and AI-powered analysis.',
    tags: ['pricing', 'plans', 'cost', 'subscription'],
  },
  {
    id: 'beta-discount',
    title: 'What is the beta discount?',
    category: 'billing',
    content: 'As an early user, you get 50% off all paid plans! This beta pricing is locked in as long as you maintain your subscription. The discount applies to both monthly and yearly billing.',
    tags: ['discount', 'beta', 'offer', 'savings'],
  },
  {
    id: 'yearly-billing',
    title: 'Do you offer yearly billing?',
    category: 'billing',
    content: 'Yes! Yearly billing gives you an additional 10% discount on top of the 50% beta discount. For example:\n\n**Starter**: ₹2,249/month (₹26,990/year) instead of ₹2,499/month\n**Pro**: ₹6,749/month (₹80,990/year) instead of ₹7,499/month\n\nYou save even more with yearly billing!',
    tags: ['yearly', 'annual', 'billing', 'discount'],
  },
  {
    id: 'usage-limits',
    title: 'What happens if I exceed my response limit?',
    category: 'billing',
    content: 'You\'ll receive notifications when you reach 80% of your monthly limit. Once you hit 100%, new survey conversations will be blocked until you:\n\n1. Upgrade to a higher plan, or\n2. Wait for your monthly limit to reset\n\nYour existing surveys remain active and accessible - you just can\'t collect new responses until you upgrade.',
    tags: ['limits', 'quota', 'responses', 'upgrade'],
  },
  {
    id: 'payment-methods',
    title: 'What payment methods do you accept?',
    category: 'billing',
    content: 'We accept all major payment methods through Razorpay:\n\n- Credit/Debit Cards (Visa, Mastercard, Amex, RuPay)\n- UPI (Google Pay, PhonePe, Paytm, etc.)\n- Net Banking\n- Wallets (Paytm, Mobikwik, etc.)\n\nAll payments are processed securely through Razorpay\'s PCI-compliant infrastructure.',
    tags: ['payment', 'razorpay', 'cards', 'upi'],
  },
  {
    id: 'refund-policy',
    title: 'What is your refund policy?',
    category: 'billing',
    content: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with Personity within the first 7 days of your paid subscription, contact us for a full refund. No questions asked.\n\nAfter 7 days, you can cancel anytime and won\'t be charged for the next billing cycle.',
    tags: ['refund', 'money-back', 'guarantee', 'cancel'],
  },

  // Account Settings
  {
    id: 'change-password',
    title: 'How do I change my password?',
    category: 'account',
    content: 'To change your password:\n\n1. Go to Settings from the sidebar\n2. Click on "Security" tab\n3. Enter your current password\n4. Enter your new password\n5. Confirm and save\n\nMake sure your password is at least 8 characters long and includes a mix of letters, numbers, and symbols.',
    tags: ['password', 'security', 'change', 'reset'],
  },
  {
    id: 'delete-account',
    title: 'How do I delete my account?',
    category: 'account',
    content: 'To delete your account:\n\n1. Go to Settings\n2. Scroll to "Danger Zone"\n3. Click "Delete Account"\n4. Confirm deletion\n\n**Warning**: This action is permanent and cannot be undone. All your surveys, responses, and data will be permanently deleted.',
    tags: ['delete', 'remove', 'account', 'close'],
  },
  {
    id: 'google-oauth',
    title: 'Can I sign in with Google?',
    category: 'account',
    content: 'Yes! You can sign up or log in using your Google account. This is faster and more secure than traditional email/password authentication. Your Google credentials are never stored on our servers.',
    tags: ['google', 'oauth', 'login', 'signin'],
  },

  // Security & Privacy
  {
    id: 'data-security',
    title: 'How is my data secured?',
    category: 'security',
    content: 'We take security seriously:\n\n- All data is encrypted at rest using AES-256\n- All connections use TLS 1.3 encryption\n- Database hosted on Supabase with enterprise-grade security\n- Regular security audits and updates\n- No data is ever sold to third parties\n\nWe comply with Indian data protection laws and follow industry best practices.',
    tags: ['security', 'encryption', 'data', 'protection'],
  },
  {
    id: 'data-privacy',
    title: 'Who can see my survey responses?',
    category: 'security',
    content: 'Only you (the survey creator) can see your survey responses and analysis. Respondents are anonymous by default - we only collect:\n\n- IP address (for fraud prevention)\n- Country code\n- Browser type\n\nWe never collect names, emails, or other personal information unless you explicitly ask for it in your survey.',
    tags: ['privacy', 'anonymous', 'data', 'access'],
  },
  {
    id: 'gdpr-compliance',
    title: 'Are you GDPR compliant?',
    category: 'security',
    content: 'Yes, Personity is designed with privacy in mind and follows GDPR principles:\n\n- Data minimization (we only collect what\'s needed)\n- Right to access (users can export their data)\n- Right to deletion (users can delete their accounts)\n- Transparent privacy policy\n- Secure data processing\n\nWe primarily serve Indian customers and comply with Indian data protection laws.',
    tags: ['gdpr', 'compliance', 'privacy', 'legal'],
  },

  // Troubleshooting
  {
    id: 'ai-not-responding',
    title: 'The AI is not responding to my survey',
    category: 'troubleshooting',
    content: 'If the AI isn\'t responding:\n\n1. Check your internet connection\n2. Refresh the page\n3. Try a different browser\n4. Clear your browser cache\n5. Check if you\'ve reached your response limit\n\nIf the issue persists, contact support with your survey ID and we\'ll investigate immediately.',
    tags: ['ai', 'not working', 'error', 'bug'],
  },
  {
    id: 'slow-responses',
    title: 'Why are AI responses slow?',
    category: 'troubleshooting',
    content: 'AI responses typically take 2-5 seconds. Slower responses can be caused by:\n\n- High server load (rare)\n- Slow internet connection\n- Complex conversations requiring more processing\n\nIf responses consistently take longer than 10 seconds, please contact support.',
    tags: ['slow', 'performance', 'speed', 'latency'],
  },
  {
    id: 'export-not-working',
    title: 'PDF export is not working',
    category: 'troubleshooting',
    content: 'If PDF export fails:\n\n1. Make sure you have at least one completed response\n2. Check your browser\'s pop-up blocker settings\n3. Try a different browser\n4. Ensure you have a stable internet connection\n\nPDF generation can take 10-15 seconds for surveys with many responses. Please be patient and don\'t refresh the page.',
    tags: ['export', 'pdf', 'download', 'error'],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryArticles = (categoryId: string) => {
    return articles.filter((a) => a.category === categoryId);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-neutral-950 mb-4 tracking-tight">
          How can we help?
        </h1>
        <p className="text-neutral-600 mb-8">
          Search our help center or browse by category
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 text-lg"
          />
        </div>
      </div>

      {selectedArticle ? (
        /* Article View */
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedArticle(null)}
            className="mb-6"
          >
            ← Back to help center
          </Button>

          <div className="bg-white border border-neutral-200 rounded-xl p-8">
            <h2 className="text-3xl font-bold text-neutral-950 mb-6">
              {selectedArticle.title}
            </h2>
            <div className="prose prose-neutral max-w-none">
              {selectedArticle.content.split('\n').map((paragraph, index) => (
                <p key={index} className="text-neutral-700 mb-4 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-4">Was this article helpful?</p>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                  Yes
                </Button>
                <Button variant="secondary" size="sm" className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                  No
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Category & Articles View */
        <div>
          {/* Categories Grid */}
          {!searchQuery && !selectedCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {categories.map((category) => {
                const Icon = category.icon;
                const articleCount = getCategoryArticles(category.id).length;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-blue-600 hover:shadow-lg transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-950 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Articles List */}
          {(searchQuery || selectedCategory) && (
            <div>
              {selectedCategory && (
                <div className="mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCategory(null)}
                    className="mb-4"
                  >
                    ← Back to categories
                  </Button>
                  <h2 className="text-2xl font-bold text-neutral-950">
                    {categories.find((c) => c.id === selectedCategory)?.name}
                  </h2>
                </div>
              )}

              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-neutral-600 mb-4">No articles found</p>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-4 hover:border-blue-600 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-neutral-950 group-hover:text-blue-600 transition-colors mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-neutral-600 line-clamp-2">
                            {article.content.substring(0, 150)}...
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-blue-600 transition-colors flex-shrink-0 ml-4" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-neutral-950 mb-2">
              Still need help?
            </h3>
            <p className="text-neutral-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button 
              variant="default" 
              size="lg"
              onClick={() => setShowContactForm(true)}
            >
              Contact Support
            </Button>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-semibold text-neutral-950 mb-4">
              Contact Support
            </h3>

            {submitSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-neutral-700 mb-6">
                  Thanks! We'll get back to you within 24 hours.
                </p>
                <Button onClick={() => {
                  setShowContactForm(false);
                  setSubmitSuccess(false);
                  setContactForm({ subject: '', message: '' });
                }}>
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                
                try {
                  const response = await fetch('/api/support/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contactForm),
                  });

                  if (response.ok) {
                    setSubmitSuccess(true);
                  } else {
                    alert('Failed to send message. Please try again.');
                  }
                } catch (error) {
                  alert('Failed to send message. Please try again.');
                } finally {
                  setIsSubmitting(false);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                      placeholder="What do you need help with?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={5}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none"
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowContactForm(false)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
