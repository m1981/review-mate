import type { AIModelConfig, AIModelResponse, IAIModelService } from '../../types/ai';

export abstract class BaseAIModelService implements IAIModelService {
    async generateResponse(prompt: string, config: AIModelConfig): Promise<AIModelResponse> {
        this.validatePrompt(prompt);
        this.validateConfig(config);

        return this.makeRequest(prompt, config);
    }

    async *streamResponse(prompt: string, config: AIModelConfig): AsyncIterator<string> {
        throw new Error('Streaming not implemented');
    }

    protected abstract makeRequest(prompt: string, config: AIModelConfig): Promise<AIModelResponse>;

    protected validatePrompt(prompt: string): void {
        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Prompt cannot be empty');
        }
    }

    validateConfig(config: AIModelConfig): void {
        if (config.temperature < 0 || config.temperature > 1) {
            throw new Error('Temperature must be between 0 and 1');
        }

        if (config.maxTokens <= 0) {
            throw new Error('MaxTokens must be positive');
        }

        if (config.topP < 0 || config.topP > 1) {
            throw new Error('TopP must be between 0 and 1');
        }

        if (!config.modelName || config.modelName.trim().length === 0) {
            throw new Error('Model name must be specified');
        }

        if (config.presencePenalty < -2 || config.presencePenalty > 2) {
            throw new Error('Presence penalty must be between -2 and 2');
        }

        if (config.frequencyPenalty < -2 || config.frequencyPenalty > 2) {
            throw new Error('Frequency penalty must be between -2 and 2');
        }
    }
}
