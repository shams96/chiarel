import nodemailer from "nodemailer";

// Wraps Hostinger's included SMTP email service — no third-party email provider
// added (user's explicit direction: reuse what's already included with Hostinger
// Business Web Hosting rather than a new paid service like Resend). See
// claudedocs/specs/dispute-risk-mitigation/PLAN.md item 5.
//
// Currently used for: the dispute-rate monitor's threshold-warning alert
// (lib/dispute-monitoring.ts). Written generically enough to reuse for order
// confirmation emails later if that's ever built — not building that now (YAGNI).
function getTransport() {
  const host = process.env.HOSTINGER_SMTP_HOST;
  const port = process.env.HOSTINGER_SMTP_PORT;
  const user = process.env.HOSTINGER_SMTP_USER;
  const pass = process.env.HOSTINGER_SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error(
      "Hostinger SMTP env vars are not fully configured (HOSTINGER_SMTP_HOST/PORT/USER/PASS)"
    );
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, pass },
  });
}

export async function sendMail(opts: { to: string; subject: string; text: string }): Promise<void> {
  const transport = getTransport();
  const from = process.env.HOSTINGER_SMTP_USER;
  await transport.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text });
}
