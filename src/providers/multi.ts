import type { SubscribeProvider } from "../types";

/**
 * Runs multiple providers in parallel.
 * Useful when you want to store to your DB AND a marketing platform simultaneously.
 *
 * @example
 *   multiProvider(
 *     resendProvider({ apiKey, topics: { "product-a": "aud_111" }, defaultTopic: "product-a" }),
 *     dbProvider({ insert: ... }),
 *   )
 */
export function multiProvider(...providers: SubscribeProvider[]): SubscribeProvider {
  return {
    subscribe: async (data) => {
      await Promise.all(providers.map((p) => p.subscribe(data)));
    },
  };
}
