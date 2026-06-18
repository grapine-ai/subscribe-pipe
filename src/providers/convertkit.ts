import type { SubscribeProvider } from "../types";

export interface ConvertKitProviderConfig {
  /** ConvertKit v3 API key */
  apiKey: string;
  /** Form ID to subscribe contacts to */
  formId: string;
  /** Optional: tag IDs applied to every subscriber regardless of topic */
  tagIds?: number[];
  /**
   * Optional map of topic name → tag IDs to apply.
   * Tags are merged with `tagIds` at subscribe time, so a subscriber
   * receives both the global tags and the topic-specific ones.
   *
   * @example
   *   topicTagMap: {
   *     "product-a": [111, 222],
   *     "product-b": [333],
   *   }
   */
  topicTagMap?: Record<string, number[]>;
}

export function convertkitProvider(config: ConvertKitProviderConfig): SubscribeProvider {
  return {
    subscribe: async ({ email, topic }) => {
      const topicTags = (topic && config.topicTagMap?.[topic]) ?? [];
      const tags = [...(config.tagIds ?? []), ...topicTags];

      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${config.formId}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: config.apiKey,
            email,
            ...(tags.length > 0 ? { tags } : {}),
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
