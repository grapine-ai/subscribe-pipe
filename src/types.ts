export interface SubscribeData {
  email: string;
  source: string;
  /** Optional topic — used to route the subscriber to the right audience/list/tag per provider. */
  topic?: string;
}

export interface SubscribeProvider {
  subscribe: (data: SubscribeData) => Promise<void>;
}
