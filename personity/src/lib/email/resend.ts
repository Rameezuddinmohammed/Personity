import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(name: string, email: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #18181B; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
          .header { margin-bottom: 32px; }
          .logo { font-size: 24px; font-weight: 600; color: #2563EB; }
          .content { background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 12px; padding: 32px; }
          h1 { font-size: 24px; font-weight: 600; margin: 0 0 16px 0; color: #0A0A0B; }
          p { margin: 0 0 16px 0; color: #3F3F46; }
          .button { display: inline-block; background: #2563EB; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin: 16px 0; }
          .footer { margin-top: 32px; text-align: center; font-size: 13px; color: #71717A; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Personity</div>
          </div>
          <div class="content">
            <h1>Welcome to Personity, ${name}!</h1>
            <p>Thank you for signing up. We're excited to help you gather meaningful insights through AI-powered conversations.</p>
            <p>With your free account, you can:</p>
            <ul>
              <li>Create unlimited surveys</li>
              <li>Collect up to 50 responses</li>
              <li>Test your surveys before publishing</li>
              <li>Get automated analysis with themes and sentiment</li>
            </ul>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Personity. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Personity!',
    html,
  });
}
