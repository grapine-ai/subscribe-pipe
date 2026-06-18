import type { SubscribeProvider } from "../types";

export interface BrevoProviderConfig {
  /** Brevo API key */
  apiKey: string;
  /** Default list ID(s) to add the contact to */
  listIds: number[];
  /** Optional: override the default lists based on the subscriber's source */
  sourceListMap?: Record<string, number>;
  /**
   * Optional: map of topic name → list ID.
   * List is added on top of whichever lists are resolved from `listIds` /
   * `sourceListMap`, so a subscriber ends up in both the base list and the
   * topic-specific list.
   *
   * @example
   *   topicListMap: {
   *     "product-a": 42,
   *     "product-b": 43,
   *   }
   */
  topicListMap?: Record<string, number>;
}

export function brevoProvider(config: BrevoProviderConfig): SubscribeProvider {
  return {
    subscribe: async ({ email, source, topic }) => {
      const baseListIds =
        config.sourceListMap?.[source] != null
          ? [config.sourceListMap[source]]
          : config.listIds;

      const topicListId = topic != null ? config.topicListMap?.[topic] : undefined;
      const listIds = topicListId != null
        ? [...new Set([...baseListIds, topicListId])]
        : baseListIds;

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
