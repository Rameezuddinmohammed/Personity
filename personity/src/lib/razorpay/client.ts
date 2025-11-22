import Razorpay from 'razorpay';

// Server-side Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Plan configurations
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

// Helper to create Razorpay order
export async function createRazorpayOrder(
  amount: number,
  planId: string,
  userId: string
) {
  const order = await razorpay.orders.create({
    amount, // in paise
    currency: 'INR',
    receipt: `order_${userId}_${Date.now()}`,
    notes: {
      plan_id: planId,
      user_id: userId,
    },
  });

  return order;
}

// Helper to verify payment signature
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const text = `${orderId}|${paymentId}`;
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(text)
    .digest('hex');

  return generated_signature === signature;
}
