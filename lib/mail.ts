import nodemailer from "nodemailer";

// Wraps Hostinger's included SMTP email service — no third-party email provider
// added (user's explicit direction: reuse what's already included with Hostinger
// Business Web Hosting rather than a new paid service like Resend). See
// claudedocs/specs/dispute-risk-mitigation/PLAN.md item 5.
//
// Currently used for: the dispute-rate monitor's threshold-warning alert
// (lib/dispute-monitoring.ts). Written generically enough to reuse for order
// confirmation emails later if that's ever built — not building that now (YAGNI).
/** The accounts@ mailbox password: ACCOUNTS_SMTP_PASS, or ACCOUNTS_SMTP_PASSWORD (either name works). */
export function accountsSmtpPass(): string | undefined {
  return process.env.ACCOUNTS_SMTP_PASS || process.env.ACCOUNTS_SMTP_PASSWORD || undefined;
}

function getTransport(useAccounts: boolean) {
  const host = process.env.HOSTINGER_SMTP_HOST;
  const port = process.env.HOSTINGER_SMTP_PORT;
  const user = useAccounts ? process.env.ACCOUNTS_SMTP_USER : process.env.HOSTINGER_SMTP_USER;
  const pass = useAccounts ? accountsSmtpPass() : process.env.HOSTINGER_SMTP_PASS;

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
    // A hung SMTP server must not hold a socket and timer open for minutes.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
}

// `fromAccounts`: send as the accounts@ mailbox (sign-in codes) when both
// ACCOUNTS_SMTP_USER and a password (ACCOUNTS_SMTP_PASS or ACCOUNTS_SMTP_PASSWORD) are set (same host/port as the main
// mailbox). If either is unset it falls back to HOSTINGER_SMTP_* exactly as before.
export async function sendMail(opts: { to: string; subject: string; text: string; fromAccounts?: boolean }): Promise<void> {
  const useAccounts = !!opts.fromAccounts && !!process.env.ACCOUNTS_SMTP_USER && !!accountsSmtpPass();
  const transport = getTransport(useAccounts);
  const from = useAccounts ? process.env.ACCOUNTS_SMTP_USER : process.env.HOSTINGER_SMTP_USER;
  await transport.sendMail({ from, to: opts.to, subject: opts.subject, text: opts.text });
}
