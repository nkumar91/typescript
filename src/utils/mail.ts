import nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true';

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
    return transporter;
  }

  // Fallback: use ethereal for development/testing when no SMTP is configured
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return transporter;
}

export async function sendMail({ to, subject, text, html }: MailOptions) {
  const t = await getTransporter();

  const from = process.env.FROM_EMAIL || `no-reply@${process.env.APP_DOMAIN || 'localhost'}`;

  const info = await t.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  // If using Ethereal, log a preview URL which is extremely handy in dev
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    // eslint-disable-next-line no-console
    console.log(`Preview URL: ${preview}`);
  }

  return info;
}

export async function sendSignupMail(to: string, name?: string, verificationUrl?: string) {
  const subject = 'Welcome to Our App — Please confirm your email';
  const safeName = name || 'there';

  const html = `
    <p>Hi ${safeName},</p>
    <p>Thanks for signing up! Please confirm your email by clicking the link below:</p>
    <p><a href="${verificationUrl || '#'}">Confirm your email</a></p>
    <p>If you didn't create an account, you can safely ignore this message.</p>
    <p>— The Team</p>
  `;

  const text = `Hi ${safeName},\n\nThanks for signing up! Confirm your email: ${verificationUrl || '#'}\n\n— The Team`;

  return sendMail({ to, subject, text, html });
}

// Usage note:
// - Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment for production
// - Optionally set FROM_EMAIL and APP_DOMAIN
// - In development, when SMTP_* are not set, ethereal email will be used and a preview URL will be logged
