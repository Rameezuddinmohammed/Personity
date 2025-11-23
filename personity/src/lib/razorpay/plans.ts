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
    responses: 20,
    features: [
      'Up to 20 responses/month',
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
    price: 499900, // BETA: 23% off - monthly in paise (₹4,999)
    priceMonthly: 499900,
    priceYearly: 5399000, // BETA: 23% off - ₹53,990 (10% yearly discount)
    priceDisplayMonthly: '₹4,999',
    priceDisplayYearly: '₹53,990',
    priceDisplayYearlyPerMonth: '₹4,499', // ₹53,990 / 12
    originalPriceMonthly: '₹6,499',
    originalPriceYearly: '₹69,990',
    currency: 'INR',
    responses: 200,
    features: [
      'Up to 200 responses/month',
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
    price: 1229900, // BETA: 23% off - monthly in paise (₹12,299)
    priceMonthly: 1229900,
    priceYearly: 13279000, // BETA: 23% off - ₹1,32,790 (10% yearly discount)
    priceDisplayMonthly: '₹12,299',
    priceDisplayYearly: '₹1,32,790',
    priceDisplayYearlyPerMonth: '₹11,066', // ₹1,32,790 / 12
    originalPriceMonthly: '₹15,999',
    originalPriceYearly: '₹1,72,790',
    currency: 'INR',
    responses: 500,
    features: [
      'Up to 500 responses/month',
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
