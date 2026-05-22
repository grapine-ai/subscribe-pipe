import type { SubscribeProvider } from "./types";

export type { SubscribeProvider } from "./types";
export type { SubscribeData } from "./types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function extractString(
  body: unknown,
  key: string
): string {
  if (body !== null && typeof body === "object" && key in body) {
    const val = (body as Record<string, unknown>)[key];
    if (typeof val === "string") return val.trim();
  }
  return "";
}

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
export function createSubscribeHandler(provider: SubscribeProvider) {
  return {
    POST: async (req: Request): Promise<Response> => {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return Response.json({ error: "Invalid request body." }, { status: 400 });
      }

      const email = extractString(body, "email").toLowerCase();
      const source = extractString(body, "source") || "unknown";

      if (!email || !isValidEmail(email)) {
        return Response.json({ error: "A valid email is required." }, { status: 400 });
      }

      try {
        await provider.subscribe({ email, source });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Could not subscribe. Please try again.";
        return Response.json({ error: message }, { status: 500 });
      }

      return Response.json({ ok: true }, { status: 200 });
    },
  };
}
