interface SubscribeData {
    email: string;
    source: string;
}
interface SubscribeProvider {
    subscribe: (data: SubscribeData) => Promise<void>;
}

export type { SubscribeData as S, SubscribeProvider as a };
