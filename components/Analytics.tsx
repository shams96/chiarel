import { getMeasurementId } from "@/lib/analytics-config";
import AnalyticsProvider from "@/components/AnalyticsProvider";

// Server component mounted once in the root layout. Renders nothing when GA4
// isn't configured or on staging. Otherwise: an inline bootstrap (runs during
// HTML parse, before hydration, so early track() calls find window.gtag) that
// defines gtag with Google Consent Mode v2 defaults DENIED, plus the client
// provider that loads gtag.js only after opt-in.
export default function Analytics() {
  const id = getMeasurementId();
  if (!id) return null;
  const bootstrap =
    `window.dataLayer=window.dataLayer||[];` +
    `function gtag(){dataLayer.push(arguments);}window.gtag=gtag;` +
    `gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});` +
    `gtag('js',new Date());gtag('config',${JSON.stringify(id)});`;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <AnalyticsProvider measurementId={id} />
    </>
  );
}
