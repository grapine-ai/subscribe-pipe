import type { SubscribeProvider } from "../types";

export interface BrevoProviderConfig {
  /** Brevo API key */
  apiKey: string;
  /** List ID(s) to add the contact to */
  listIds: number[];
  /** Optional: map source string to a specific list ID */
  sourceListMap?: Record<string, number>;
}

export function brevoProvider(config: BrevoProviderConfig): SubscribeProvider {
  return {
    subscribe: async ({ email, source }) => {
      const listIds =
        config.sourceListMap?.[source] != null
          ? [config.sourceListMap[source]]
          : config.listIds;

      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          listIds,
          updateEnabled: true,
        }),
      });

      // 201 = created, 204 = already exists and updated
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as Record<string, unknown>).message as string ?? `Brevo error ${res.status}`
        );
      }
    },
  };
}
