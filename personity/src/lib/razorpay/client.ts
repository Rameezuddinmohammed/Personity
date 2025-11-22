import Razorpay from 'razorpay';
import { PLANS, type PlanId } from './plans';

// Re-export for convenience
export { PLANS, type PlanId };

// Lazy-loaded Razorpay instance to avoid initialization errors
let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// Helper to create Razorpay order
export async function createRazorpayOrder(
  amount: number,
  planId: string,
  userId: string
) {
  const razorpay = getRazorpayInstance();
  
  // Generate short receipt ID (max 40 chars)
  // Use first 8 chars of userId + timestamp
  const shortUserId = userId.substring(0, 8);
  const timestamp = Date.now().toString().substring(5); // Last 8 digits
  const receipt = `ord_${shortUserId}_${timestamp}`; // ~20 chars
  
  const order = await razorpay.orders.create({
    amount, // in paise
    currency: 'INR',
    receipt,
    notes: {
      plan_id: planId,
      user_id: userId, // Full userId in notes for reference
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
