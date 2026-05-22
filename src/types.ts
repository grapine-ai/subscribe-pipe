export interface SubscribeData {
  email: string;
  source: string;
}

export interface SubscribeProvider {
  subscribe: (data: SubscribeData) => Promise<void>;
}
