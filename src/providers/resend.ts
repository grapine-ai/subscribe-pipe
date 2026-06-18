import type { SubscribeProvider } from "../types";

export interface ResendProviderConfig {
  /** Resend API key — re_... */
  apiKey: string;
  /**
   * Resend segment IDs to assign the contact to.
   * Segments are created in the Resend dashboard (Audiences → Segments).
   * Added via a separate POST /contacts/{email}/segments/{id} call after
   * contact creation — Resend does not support segment assignment in the
   * create-contact body.
   *
   * @example segmentIds: ["seg_abc123"]
   */
  segmentIds?: string[];
  /**
   * Resend topic IDs to subscribe the contact to (all set to opt_in).
   * Topics are created in the Resend dashboard (Audiences → Topics).
   * Sent as `topics: [{ id, subscription: "opt_in" }]` in the create-contact body.
   *
   * @example topicIds: ["top_xyz789"]
   */
  topicIds?: string[];
}

interface ResendContactBody {
  email: string;
  unsubscribed: boolean;
  topics?: { id: string; subscription: "opt_in" | "opt_out" }[];
}

export function resendProvider(config: ResendProviderConfig): SubscribeProvider {
  const headers = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  return {
    subscribe: async ({ email }) => {
      const body: ResendContactBody = { email, unsubscribed: false };

      if (config.topicIds?.length) {
        body.topics = config.topicIds.map((id) => ({ id, subscription: "opt_in" }));
      }

      // Step 1: create the contact (topics assigned inline)
      const res = await fetch("https://api.resend.com/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as Record<string, unknown>).message as string ?? `Resend error ${res.status}`
        );
      }

      // Step 2: assign segments — requires a separate call per segment
      if (config.segmentIds?.length) {
        await Promise.all(
          config.segmentIds.map(async (segmentId) => {
            const r = await fetch(
              `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
              { method: "POST", headers }
            );
            if (!r.ok) {
              const err = await r.json().catch(() => ({}));
              throw new Error(
                (err as Record<string, unknown>).message as string ??
                  `Resend segment error ${r.status}`
              );
            }
          })
        );
      }
    },
  };
}
