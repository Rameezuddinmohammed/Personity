// Plan configurations (separated from Razorpay client to avoid initialization issues)
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'INR',
    responses: 50,
    features: [
      '50 responses per month',
      'All core features',
      'PDF & CSV export',
      'Community support',
      'Powered by Personity branding',
    ],
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 499900, // in paise (₹4,999)
    priceDisplay: '₹4,999',
    currency: 'INR',
    responses: 500,
    features: [
      '500 responses per month',
      'All core features',
      'Remove branding',
      'PDF & CSV export',
      'Email support (48hr response)',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 1499900, // in paise (₹14,999)
    priceDisplay: '₹14,999',
    currency: 'INR',
    responses: 2000,
    features: [
      '2,000 responses per month',
      'All core features',
      'Remove branding',
      'PDF & CSV export',
      'Priority support (24hr response)',
      'Early access to new features',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceDisplay: 'Custom',
    currency: 'INR',
    responses: null,
    features: [
      'Unlimited responses',
      'Custom contracts & invoicing',
      'Dedicated account manager',
      'Custom data retention',
      'SLA guarantees',
      'Priority feature requests',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
