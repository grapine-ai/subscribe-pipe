import type { SubscribeProvider, SubscribeData } from "../types";

export interface DbProviderConfig {
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
  insert: (data: SubscribeData & { subscribedAt: Date }) => Promise<unknown>;
}

export function dbProvider(config: DbProviderConfig): SubscribeProvider {
  return {
    subscribe: async (data) => {
      await config.insert({ ...data, subscribedAt: new Date() });
    },
  };
}
