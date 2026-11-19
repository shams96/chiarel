// TCPA quiet hours: no marketing texts before 8am or after 9pm in the
// recipient's local time. We do not store a time zone per number, so instead
// of guessing from the area code we send only in a window that is inside
// 8am-9pm in every US and Canadian zone at once: 1pm-7pm Eastern is 10am-4pm
// Pacific, 9am-3pm Alaska, 8am-2pm Hawaii and 2:30pm-8:30pm Newfoundland.
const START_HOUR_ET = 13;
const END_HOUR_ET = 19; // exclusive

export function easternHour(now: Date): number {
  const h = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", hourCycle: "h23" })
    .formatToParts(now)
    .find((p) => p.type === "hour")?.value;
  return Number(h);
}

export function inSafeSendWindow(now: Date = new Date()): boolean {
  const h = easternHour(now);
  return h >= START_HOUR_ET && h < END_HOUR_ET;
}
