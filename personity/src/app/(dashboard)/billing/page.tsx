'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, Building2, ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/razorpay/plans';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface UserUsage {
  plan: string;
  responsesUsedThisMonth: number;
  limit: number;
}

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    // Fetch user usage data
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const userPlan = data.user.plan || 'FREE';
          const planConfig = PLANS[userPlan as keyof typeof PLANS];
          setUsage({
            plan: userPlan,
            responsesUsedThisMonth: data.user.responsesUsedThisMonth || 0,
            limit: planConfig.responses || 0,
          });
        }
      })
      .catch((error) => console.error('Failed to fetch usage:', error));
  }, []);

  const handleUpgrade = async (planId: 'starter' | 'pro') => {
    setIsLoading(planId);

    try {
      // Create Razorpay order
      const response = await fetch('/api/billing/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: data.order.currency,
          name: 'Personity',
          description: `${PLANS[planId.toUpperCase() as keyof typeof PLANS].name} Plan`,
          order_id: data.order.id,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/billing/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                planId,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              router.push('/dashboard?upgraded=true');
              router.refresh();
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            email: data.user.email,
            name: data.user.name,
          },
          theme: {
            color: '#2563EB',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Sparkles className="w-6 h-6 text-neutral-600" />;
      case 'starter':
        return <Zap className="w-6 h-6 text-blue-600" />;
      case 'pro':
        return <Sparkles className="w-6 h-6 text-purple-600" />;
      case 'enterprise':
        return <Building2 className="w-6 h-6 text-neutral-950" />;
      default:
        return null;
    }
  };

  const usagePercentage = usage
    ? Math.min((usage.responsesUsedThisMonth / usage.limit) * 100, 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Usage Display */}
      {usage && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-950 mb-1">
                Current Usage
              </h2>
              <p className="text-sm text-neutral-600">
                {usage.plan} Plan • Resets monthly
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-neutral-600" />
              <span className="font-medium text-neutral-950">
                {usage.responsesUsedThisMonth} / {usage.limit}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 ${
                usagePercentage >= 100
                  ? 'bg-red-600'
                  : usagePercentage >= 80
                  ? 'bg-yellow-600'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>

          {/* Warning Messages */}
          {usagePercentage >= 100 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Limit reached!</strong> Upgrade your plan to continue collecting responses.
              </p>
            </div>
          )}
          {usagePercentage >= 80 && usagePercentage < 100 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Almost there!</strong> You've used {Math.round(usagePercentage)}% of your monthly limit.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold text-neutral-950 mb-3 tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-neutral-600 mb-6">
          Start free, upgrade as you grow. Cancel anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center gap-3 bg-neutral-100 rounded-full p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Billed Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === 'yearly'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Billed Yearly
            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 10%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {Object.entries(PLANS)
          .filter(([key]) => key !== 'FREE')
          .map(([key, plan]) => {
            const isPopular = key === 'PRO';
            const currentPrice =
              billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            const priceDisplay =
              billingCycle === 'yearly'
                ? plan.priceDisplayYearly
                : plan.priceDisplayMonthly;

            return (
              <div
                key={key}
                className={`bg-white border rounded-2xl p-8 flex flex-col relative ${
                  isPopular
                    ? 'border-emerald-600 shadow-lg bg-gradient-to-br from-emerald-50 to-white'
                    : 'border-neutral-200'
                }`}
              >
                {/* Plan Name & Description */}
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-neutral-950 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {(plan as any).description || ''}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {currentPrice === null ? (
                    <div className="text-4xl font-bold text-neutral-950">Custom</div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold text-neutral-950">
                        {priceDisplay}
                      </div>
                      <p className="text-sm text-neutral-600 mt-1">
                        {billingCycle === 'yearly' ? 'Per year' : 'Per month'}
                      </p>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {key === 'ENTERPRISE' ? (
                  <Button
                    variant="default"
                    className="w-full mb-6 bg-orange-500 hover:bg-orange-600"
                    onClick={() => setShowEnterpriseForm(true)}
                  >
                    Get This Plan
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="w-full mb-6 bg-orange-500 hover:bg-orange-600"
                    onClick={() => handleUpgrade(plan.id as 'starter' | 'pro')}
                    disabled={isLoading === plan.id}
                  >
                    {isLoading === plan.id ? 'Processing...' : 'Get This Plan'}
                  </Button>
                )}

                {/* Features */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-950 mb-4">
                    This Plan Includes:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
      </div>

      {/* Enterprise Contact Form Modal */}
      {showEnterpriseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-semibold text-neutral-950 mb-4">
              Contact Sales
            </h2>
            <p className="text-neutral-600 mb-6">
              Tell us about your needs and we'll get back to you within 24 hours.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                
                const response = await fetch('/api/billing/enterprise-inquiry', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company'),
                    companySize: formData.get('companySize'),
                    expectedResponses: formData.get('expectedResponses'),
                    message: formData.get('message'),
                  }),
                });

                if (response.ok) {
                  alert('Thank you! We\'ll contact you within 24 hours.');
                  setShowEnterpriseForm(false);
                } else {
                  alert('Failed to submit. Please try again.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Company Size *
                </label>
                <select
                  name="companySize"
                  required
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                >
                  <option value="">Select size</option>
                  <option value="50-200">50-200 employees</option>
                  <option value="200-1000">200-1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Expected Monthly Responses *
                </label>
                <input
                  type="number"
                  name="expectedResponses"
                  required
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  name="message"
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  placeholder="Tell us about your use case..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowEnterpriseForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" className="flex-1">
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-8">
        <h2 className="text-xl font-semibold text-neutral-950 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-neutral-950 mb-2">
              Can I change plans later?
            </h3>
            <p className="text-sm text-neutral-600">
              Yes! You can upgrade or downgrade at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-neutral-950 mb-2">
              What happens if I exceed my response limit?
            </h3>
            <p className="text-sm text-neutral-600">
              You'll be notified when you reach 80% of your limit. Once exceeded, you'll need to upgrade to continue collecting responses.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-neutral-950 mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-sm text-neutral-600">
              We offer a 7-day money-back guarantee if you're not satisfied with the service.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-neutral-950 mb-2">
              Is my data secure?
            </h3>
            <p className="text-sm text-neutral-600">
              Yes. All data is encrypted at rest and in transit. We comply with Indian data protection laws.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
