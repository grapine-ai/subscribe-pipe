import { a as SubscribeProvider, S as SubscribeData } from './types-CITwlflW.mjs';

interface ResendProviderConfig {
    /** Resend API key — re_... */
    apiKey: string;
    /** Audience ID from resend.com/audiences */
    audienceId: string;
}
declare function resendProvider(config: ResendProviderConfig): SubscribeProvider;

interface ConvertKitProviderConfig {
    /** ConvertKit v3 API key */
    apiKey: string;
    /** Form ID to subscribe contacts to */
    formId: string;
    /** Optional: tag IDs to apply to the subscriber */
    tagIds?: number[];
}
declare function convertkitProvider(config: ConvertKitProviderConfig): SubscribeProvider;

interface BrevoProviderConfig {
    /** Brevo API key */
    apiKey: string;
    /** List ID(s) to add the contact to */
    listIds: number[];
    /** Optional: map source string to a specific list ID */
    sourceListMap?: Record<string, number>;
}
declare function brevoProvider(config: BrevoProviderConfig): SubscribeProvider;

interface DbProviderConfig {
    /**
     * Receives the validated subscriber data and persists it.
     * Works with any ORM or DB client — Prisma, Drizzle, Supabase, Kysely, raw SQL.
     *
     * @example Prisma
     *   insert: (data) => prisma.subscriber.upsert({
     *     where: { email: data.email },
     *     create: data,
     *     update: {},
     *   })
     *
     * @example Drizzle
     *   insert: (data) => db.insert(subscribers).values(data).onConflictDoNothing()
     *
     * @example Supabase
     *   insert: (data) => supabase.from("subscribers").upsert(data)
     */
    insert: (data: SubscribeData & {
        subscribedAt: Date;
    }) => Promise<unknown>;
}
declare function dbProvider(config: DbProviderConfig): SubscribeProvider;

/**
 * Runs multiple providers in parallel.
 * Useful when you want to store to your DB AND a marketing platform simultaneously.
 *
 * @example
 *   multiProvider(
 *     resendProvider({ apiKey, audienceId }),
 *     dbProvider({ insert: ... }),
 *   )
 */
declare function multiProvider(...providers: SubscribeProvider[]): SubscribeProvider;

export { type BrevoProviderConfig, type ConvertKitProviderConfig, type DbProviderConfig, type ResendProviderConfig, brevoProvider, convertkitProvider, dbProvider, multiProvider, resendProvider };
