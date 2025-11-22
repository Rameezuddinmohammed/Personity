import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPaymentSignature } from '@/lib/razorpay/client';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
  planId: z.enum(['starter', 'pro']),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request
    const body = await request.json();
    const { orderId, paymentId, signature, planId } = verifyPaymentSchema.parse(body);

    // Verify payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update user subscription
    const { error: updateError } = await supabase
      .from('User')
      .update({
        plan: planId.toUpperCase() as 'STARTER' | 'PRO',
        subscriptionStatus: 'ACTIVE',
        subscriptionStartDate: new Date().toISOString(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        responsesUsedThisMonth: 0,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Update subscription error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    // Track payment event
    if (typeof window !== 'undefined') {
      const { trackSubscriptionStarted } = await import('@/lib/posthog/events');
      trackSubscriptionStarted(user.id, planId, planId === 'starter' ? 4999 : 14999);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated',
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
