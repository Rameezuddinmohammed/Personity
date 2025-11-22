import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const enterpriseInquirySchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  companySize: z.enum(['50-200', '200-1000', '1000+']),
  expectedResponses: z.string(),
  message: z.string().optional(),
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
    const inquiry = enterpriseInquirySchema.parse(body);

    // TODO: Send email notification to support@personity.app
    // For now, just log it
    console.log('Enterprise Inquiry:', {
      userId: user.id,
      ...inquiry,
      timestamp: new Date().toISOString(),
    });

    // You can integrate with Resend here to send email:
    // await resend.emails.send({
    //   from: 'Personity <noreply@personity.app>',
    //   to: 'support@personity.app',
    //   subject: `Enterprise Inquiry from ${inquiry.company}`,
    //   html: `...inquiry details...`,
    // });

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    console.error('Enterprise inquiry error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
