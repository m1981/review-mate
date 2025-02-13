export class AIModelServiceFactory {
    private static instances: Map<ProviderKey, IAIModelService> = new Map();

    static getService(provider: ProviderKey, apiKey: string): IAIModelService {
        if (!this.instances.has(provider)) {
            switch (provider) {
                case 'openai':
                    this.instances.set(provider, new OpenAIService(apiKey));
                    break;
                case 'anthropic':
                    // TODO: Implement Anthropic service
                    throw new Error('Anthropic service not implemented');
                default:
                    throw new Error(`Unknown provider: ${provider}`);
            }
        }
        return this.instances.get(provider)!;
    }
}