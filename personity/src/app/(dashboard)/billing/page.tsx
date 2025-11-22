'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Sparkles, Zap, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLANS } from '@/lib/razorpay/client';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showEnterpriseForm, setShowEnterpriseForm] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-neutral-950 mb-3 tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-neutral-600">
          Start free, upgrade as you grow. Cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {Object.entries(PLANS).map(([key, plan]) => {
          const isPopular = key === 'STARTER';
          const isPro = key === 'PRO';

          return (
            <div
              key={key}
              className={`bg-white border rounded-2xl p-8 relative ${
                isPopular
                  ? 'border-blue-600 shadow-lg scale-105'
                  : isPro
                  ? 'border-purple-600 shadow-lg scale-105'
                  : 'border-neutral-200'
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Best Value Badge */}
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className="mb-4">{getPlanIcon(plan.id)}</div>

              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-neutral-950 mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                {plan.price === null ? (
                  <div className="text-3xl font-semibold text-neutral-950">
                    Custom
                  </div>
                ) : plan.price === 0 ? (
                  <div className="text-3xl font-semibold text-neutral-950">
                    Free
                  </div>
                ) : (
                  <div>
                    <span className="text-3xl font-semibold text-neutral-950">
                      {plan.priceDisplay}
                    </span>
                    <span className="text-neutral-600 text-sm">/month</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {key === 'FREE' ? (
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : key === 'ENTERPRISE' ? (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => setShowEnterpriseForm(true)}
                >
                  Contact Sales
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant={isPopular || isPro ? 'default' : 'secondary'}
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id as 'starter' | 'pro')}
                  disabled={isLoading === plan.id}
                >
                  {isLoading === plan.id ? 'Processing...' : 'Upgrade Now'}
                </Button>
              )}
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
