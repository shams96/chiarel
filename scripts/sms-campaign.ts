// Send one marketing text to everyone with a live saved yes.
// Dry run by default. To send for real: SMS_SEND_ENABLED=on plus Twilio keys in
// the environment, and pass --send. Messages go out only inside the safe send
// window (1pm-7pm Eastern); outside it every number is skipped, nothing queued.
//   npx dotenv -e .env -- tsx scripts/sms-campaign.ts "Your text here" [--send]
import { numbersWithLiveConsent, sendMarketingText, withOptOut } from "../lib/sms-send";
import { inSafeSendWindow } from "../lib/sms-window";

async function main() {
  const [body, flag] = process.argv.slice(2);
  if (!body) throw new Error('Usage: sms-campaign.ts "message" [--send]');
  const numbers = await numbersWithLiveConsent();
  console.log(`Message: ${withOptOut(body)}`);
  console.log(`Recipients with a live yes: ${numbers.length}`);
  console.log(`Inside safe send window now: ${inSafeSendWindow()}`);
  if (flag !== "--send") return console.log("Dry run. Nothing sent. Add --send to send.");
  const tally: Record<string, number> = {};
  for (const n of numbers) {
    const r = await sendMarketingText(n, body);
    const k = r.sent ? "sent" : r.reason;
    tally[k] = (tally[k] ?? 0) + 1;
  }
  console.log(tally);
}
main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
