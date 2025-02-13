export interface ProviderConfig extends AIModelConfig {
    provider: ProviderKey;
    stream?: boolean;
}

export interface Provider {
    id: ProviderKey;
    name: string;
    models: string[];
    maxTokens: Record<string, number>;
    endpoints: string[];
    costs: Record<string, {
        price: number;
        unit: number;
    }>;
}