// Plan configurations (separated from Razorpay client to avoid initialization issues)
export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out Personity',
    price: 0,
    priceMonthly: 0,
    priceYearly: 0,
    priceDisplayMonthly: '₹0',
    priceDisplayYearly: '₹0',
    currency: 'INR',
    responses: 50,
    features: [
      'Up to 50 responses/month',
      'All core features',
      'PDF & CSV export',
      'Community support',
      'Powered by Personity branding',
    ],
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small teams and startups',
    price: 499900, // monthly in paise (₹4,999)
    priceMonthly: 499900,
    priceYearly: 5399000, // ₹53,990 (10% off from ₹59,988)
    priceDisplayMonthly: '₹4,999',
    priceDisplayYearly: '₹53,990',
    currency: 'INR',
    responses: 500,
    features: [
      'Up to 500 responses/month',
      'All core features',
      'Remove branding',
      'PDF & CSV export',
      'Email support (48hr response)',
    ],
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    description: 'Essential for growing teams and companies',
    price: 1499900, // monthly in paise (₹14,999)
    priceMonthly: 1499900,
    priceYearly: 16199000, // ₹1,61,990 (10% off from ₹1,79,988)
    priceDisplayMonthly: '₹14,999',
    priceDisplayYearly: '₹1,61,990',
    currency: 'INR',
    responses: 2000,
    features: [
      'Up to 2,000 responses/month',
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
    description: 'For large teams with custom needs',
    price: null,
    priceMonthly: null,
    priceYearly: null,
    priceDisplayMonthly: 'Custom',
    priceDisplayYearly: 'Custom',
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
