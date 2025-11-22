import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/razorpay/client';
import { PLANS } from '@/lib/razorpay/plans';
import { z } from 'zod';

const createOrderSchema = z.object({
  planId: z.enum(['starter', 'pro']),
  billingCycle: z.enum(['monthly', 'yearly']).optional().default('monthly'),
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
    const { planId, billingCycle } = createOrderSchema.parse(body);

    // Get plan details
    const plan = PLANS[planId.toUpperCase() as keyof typeof PLANS];
    
    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    
    if (!price) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan pricing' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await createRazorpayOrder(price, planId, user.id);

    // Get user details
    const { data: userData } = await supabase
      .from('User')
      .select('email, name')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      order,
      user: {
        email: userData?.email || user.email,
        name: userData?.name || '',
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
