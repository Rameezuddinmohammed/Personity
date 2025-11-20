import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch full user details from database
    const { data: userDetails, error: fetchError } = await supabaseAdmin
      .from('User')
      .select('id, email, name, plan, responsesUsedThisMonth, subscriptionStatus, subscriptionRenewsAt, createdAt')
      .eq('id', user.id)
      .single();

    if (fetchError || !userDetails) {
      console.error('Error fetching user:', fetchError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: userDetails }, { status: 200 });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}
