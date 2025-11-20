import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { z } from 'zod';

const createUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name } = createUserSchema.parse(body);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('User')
      .select('*')
      .eq('id', id)
      .single();

    if (existingUser) {
      return NextResponse.json({ success: true, user: existingUser });
    }

    // Create user
    const { data, error: insertError } = await supabaseAdmin
      .from('User')
      .insert({
        id,
        email,
        name,
        passwordHash: '', // Supabase handles passwords
        plan: 'FREE',
        responsesUsedThisMonth: 0,
        subscriptionStatus: 'ACTIVE',
      })
      .select()
      .single();

    if (insertError || !data) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
