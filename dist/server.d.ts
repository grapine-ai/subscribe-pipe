import { a as SubscribeProvider } from './types-CITwlflW.js';
export { S as SubscribeData } from './types-CITwlflW.js';

/**
 * Returns a Next.js App Router POST handler wired to any SubscribeProvider.
 *
 * @example Resend
 *   import { createSubscribeHandler } from "@grapine.ai/subscribe-pipe/server";
 *   import { resendProvider } from "@grapine.ai/subscribe-pipe/providers";
 *
 *   export const { POST } = createSubscribeHandler(
 *     resendProvider({
 *       apiKey: process.env.RESEND_API_KEY!,
 *       audienceId: process.env.RESEND_AUDIENCE_ID!,
 *     })
 *   );
 *
 * @example Multiple destinations
 *   import { multiProvider, resendProvider, dbProvider } from "@grapine.ai/subscribe-pipe/providers";
 *
 *   export const { POST } = createSubscribeHandler(
 *     multiProvider(
 *       resendProvider({ apiKey: "...", audienceId: "..." }),
 *       dbProvider({ insert: (data) => db.insert(subscribers).values(data) }),
 *     )
 *   );
 */
declare function createSubscribeHandler(provider: SubscribeProvider): {
    POST: (req: Request) => Promise<Response>;
};

export { SubscribeProvider, createSubscribeHandler };
