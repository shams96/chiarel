// Optional ESP forwarding. No-ops unless both env vars are set. Failure never
// blocks the signup: our own table is the source of truth.
export async function forwardToKlaviyo(email: string): Promise<boolean> {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  const listId = process.env.KLAVIYO_LIST_ID;
  if (!key || !listId) return false;
  try {
    const res = await fetch("https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/", {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        revision: "2024-10-15",
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  },
                },
              ],
            },
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });
    if (!res.ok) throw new Error(`Klaviyo responded ${res.status}`);
    return true;
  } catch (err) {
    console.error("Klaviyo forward failed:", err);
    return false;
  }
}
