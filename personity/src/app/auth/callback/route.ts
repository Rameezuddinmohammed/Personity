import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user exists in our database
      const { data: existingUser } = await supabaseAdmin
        .from('User')
        .select('id')
        .eq('id', data.user.id)
        .single();

      // Create user in our database if doesn't exist
      if (!existingUser) {
        await supabaseAdmin
          .from('User')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.name || data.user.email!.split('@')[0],
            passwordHash: '', // OAuth users don't have password
            plan: 'FREE',
            responsesUsedThisMonth: 0,
            subscriptionStatus: 'ACTIVE',
          });
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
