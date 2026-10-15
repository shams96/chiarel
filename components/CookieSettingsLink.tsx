import { getMeasurementId } from "@/lib/analytics-config";
import CookieSettingsButton from "@/components/CookieSettingsButton";

// Footer link that reopens the consent banner. Renders nothing when analytics
// is off (nothing non-essential to configure).
export default function CookieSettingsLink() {
  if (!getMeasurementId()) return null;
  return <CookieSettingsButton />;
}
