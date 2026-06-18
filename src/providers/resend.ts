import type { SubscribeProvider } from "../types";

export interface ResendProviderConfig {
  /** Resend API key — re_... */
  apiKey: string;
  /**
   * Map of topic name → Resend audience ID.
   * Each topic routes subscribers to a separate Resend audience.
   *
   * @example
   *   topics: {
   *     "product-a": "aud_111aaa",
   *     "product-b": "aud_222bbb",
   *   }
   */
  topics: Record<string, string>;
  /**
   * Topic to use when none is passed at subscribe time.
   * Must be a key that exists in `topics`.
   */
  defaultTopic?: string;
}

export function resendProvider(config: ResendProviderConfig): SubscribeProvider {
  return {
    subscribe: async ({ email, topic }) => {
      const resolvedTopic = topic ?? config.defaultTopic;
      if (!resolvedTopic) {
        throw new Error(
          "Resend: no topic provided. Pass `topic` when calling subscribe(), or set `defaultTopic` in the provider config."
        );
      }
      const audienceId = config.topics[resolvedTopic];
      if (!audienceId) {
        throw new Error(
          `Resend: no audience ID configured for topic "${resolvedTopic}". Add it to the \`topics\` map in your resendProvider config.`
        );
      }

      const res = await fetch(
        `https://api.resend.com/audiences/${audienceId}/contacts`,
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
