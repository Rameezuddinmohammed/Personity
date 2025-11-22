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
    console.log('=== Create Order API Called ===');
    const supabase = await createClient();
    
    // Verify authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log('User authenticated:', user?.id);

    if (!user) {
      console.error('No user found');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate request
    const body = await request.json();
    console.log('Request body:', body);
    
    const { planId, billingCycle } = createOrderSchema.parse(body);
    console.log('Parsed:', { planId, billingCycle });

    // Get plan details
    const planKey = planId.toUpperCase() as keyof typeof PLANS;
    const plan = PLANS[planKey];
    console.log('Plan lookup:', planKey, plan);
    
    if (!plan) {
      console.error('Plan not found:', planKey);
      return NextResponse.json(
        { success: false, error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    console.log('Price selected:', price, 'for cycle:', billingCycle);
    
    if (!price) {
      console.error('No price found for plan');
      return NextResponse.json(
        { success: false, error: 'Invalid plan pricing' },
        { status: 400 }
      );
    }

    // Check Razorpay credentials
    console.log('Razorpay credentials check:', {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
    });

    // Create Razorpay order
    console.log('Creating Razorpay order with amount:', price);
    const order = await createRazorpayOrder(price, planId, user.id);
    console.log('Razorpay order created:', order.id);

    // Get user details
    const { data: userData } = await supabase
      .from('User')
      .select('email, name')
      .eq('id', user.id)
      .single();

    console.log('User data fetched:', userData?.email);

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
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
