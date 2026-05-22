import type { SubscribeProvider } from "../types";

export interface ConvertKitProviderConfig {
  /** ConvertKit v3 API key */
  apiKey: string;
  /** Form ID to subscribe contacts to */
  formId: string;
  /** Optional: tag IDs to apply to the subscriber */
  tagIds?: number[];
}

export function convertkitProvider(config: ConvertKitProviderConfig): SubscribeProvider {
  return {
    subscribe: async ({ email }) => {
      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${config.formId}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: config.apiKey,
            email,
            ...(config.tagIds ? { tags: config.tagIds } : {}),
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as Record<string, unknown>).message as string ?? `ConvertKit error ${res.status}`
        );
      }
    },
  };
}
