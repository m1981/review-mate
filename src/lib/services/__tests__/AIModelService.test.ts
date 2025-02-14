import { describe, it, expect, beforeEach } from 'vitest';
import type { AIModelConfig } from '$lib/types';
import { BaseAIModelService } from '../ai/BaseAIModelService';

// Test implementation of BaseAIModelService
class TestAIModelService extends BaseAIModelService {
    protected async makeRequest(prompt: string, config: AIModelConfig) {
        return {
            content: `Response to: ${prompt}`,
            usage: {
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            }
        };
    }
}

describe('BaseAIModelService', () => {
    let aiService: TestAIModelService;

    const defaultConfig: AIModelConfig = {
            modelName: 'test-model',
            temperature: 0.7,
            maxTokens: 100,
            topP: 1,
            presencePenalty: 0,
            frequencyPenalty: 0
        };

    beforeEach(() => {
        aiService = new TestAIModelService();
    });

    describe('generateResponse', () => {
        it('should validate empty prompt', async () => {
            await expect(aiService.generateResponse('', defaultConfig))
                .rejects.toThrow('Prompt cannot be empty');
        });

        it('should validate temperature range', async () => {
            const invalidConfig = { ...defaultConfig, temperature: 2.0 };
            await expect(aiService.generateResponse('test', invalidConfig))
                .rejects.toThrow('Temperature must be between 0 and 1');
        });

        it('should validate maxTokens', async () => {
            const invalidConfig = { ...defaultConfig, maxTokens: 0 };
            await expect(aiService.generateResponse('test', invalidConfig))
                .rejects.toThrow('MaxTokens must be positive');
        });

        it('should generate valid response', async () => {
            const response = await aiService.generateResponse('test', defaultConfig);
            expect(response).toEqual({
                content: 'Response to: test',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            });
        });
    });

    describe('validateConfig', () => {
        it('should throw for invalid temperature', async () => {
            const invalidConfig = { ...defaultConfig, temperature: -1 };
            await expect(aiService.validateConfig(invalidConfig))
                .rejects.toThrow('Temperature must be between 0 and 1');
        });

        it('should throw for invalid maxTokens', async () => {
            const invalidConfig = { ...defaultConfig, maxTokens: -1 };
            await expect(aiService.validateConfig(invalidConfig))
                .rejects.toThrow('MaxTokens must be positive');
        });

        it('should throw for invalid topP', async () => {
            const invalidConfig = { ...defaultConfig, topP: 1.1 };
            await expect(aiService.validateConfig(invalidConfig))
                .rejects.toThrow('TopP must be between 0 and 1');
        });

        it('should throw for invalid presencePenalty', async () => {
            const invalidConfig = { ...defaultConfig, presencePenalty: 3 };
            await expect(aiService.validateConfig(invalidConfig))
                .rejects.toThrow('Presence penalty must be between -2 and 2');
        });

        it('should throw for invalid frequencyPenalty', async () => {
            const invalidConfig = { ...defaultConfig, frequencyPenalty: -3 };
            await expect(aiService.validateConfig(invalidConfig))
                .rejects.toThrow('Frequency penalty must be between -2 and 2');
        });

        it('should not throw for valid config', async () => {
            await expect(aiService.validateConfig(defaultConfig))
                .resolves.toBeUndefined();
        });
    });
});
