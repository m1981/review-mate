// src/lib/services/ai/BaseAIModelService.ts
import type { AIModelConfig, AIModelResponse, IAIModelService } from '$lib/types/ai';
import { AIServiceError } from '$lib/types';

export abstract class BaseAIModelService implements IAIModelService {
    async generateResponse(prompt: string, config: AIModelConfig): Promise<AIModelResponse> {
        await this.validatePrompt(prompt);
        await this.validateConfig(config);
        return this.makeRequest(prompt, config);
    }

    async *streamResponse(prompt: string, config: AIModelConfig): AsyncIterator<string> {
        throw new Error('Streaming not implemented');
    }

    protected abstract makeRequest(prompt: string, config: AIModelConfig): Promise<AIModelResponse>;

    protected async validatePrompt(prompt: string): Promise<void> {
        if (!prompt || prompt.trim().length === 0) {
            throw new AIServiceError('Prompt cannot be empty', 'INVALID_INPUT');
        }
    }

    protected async validateConfig(config: AIModelConfig): Promise<void> {
        if (config.temperature < 0 || config.temperature > 1) {
            throw new AIServiceError('Temperature must be between 0 and 1', 'INVALID_CONFIG');
        }

        if (config.maxTokens <= 0) {
            throw new AIServiceError('MaxTokens must be positive', 'INVALID_CONFIG');
        }

        if (config.topP < 0 || config.topP > 1) {
            throw new AIServiceError('TopP must be between 0 and 1', 'INVALID_CONFIG');
        }

        if (!config.modelName || config.modelName.trim().length === 0) {
            throw new AIServiceError('Model name must be specified', 'INVALID_CONFIG');
        }

        if (config.presencePenalty < -2 || config.presencePenalty > 2) {
            throw new AIServiceError('Presence penalty must be between -2 and 2', 'INVALID_CONFIG');
        }

        if (config.frequencyPenalty < -2 || config.frequencyPenalty > 2) {
            throw new AIServiceError('Frequency penalty must be between -2 and 2', 'INVALID_CONFIG');
        }
    }
}
