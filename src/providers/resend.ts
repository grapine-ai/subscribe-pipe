import type { SubscribeProvider } from "../types";

export interface ResendProviderConfig {
  /** Resend API key — re_... */
  apiKey: string;
  /** Audience ID from resend.com/audiences */
  audienceId: string;
}

export function resendProvider(config: ResendProviderConfig): SubscribeProvider {
  return {
    subscribe: async ({ email }) => {
      const res = await fetch(
        `https://api.resend.com/audiences/${config.audienceId}/contacts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as Record<string, unknown>).message as string ?? `Resend error ${res.status}`
        );
      }
    },
  };
}
