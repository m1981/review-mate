import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseAIModelService } from '../ai/BaseAIModelService';
import type { AIModelConfig, AIModelResponse } from '../../types/ai';

// Mock implementation for testing
class TestAIModelService extends BaseAIModelService {
    protected async makeRequest(prompt: string, config: AIModelConfig): Promise<AIModelResponse> {
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
    let defaultConfig: AIModelConfig;

    beforeEach(() => {
        aiService = new TestAIModelService();
        defaultConfig = {
            modelName: 'test-model',
            temperature: 0.7,
            maxTokens: 100,
            topP: 1,
            presencePenalty: 0,
            frequencyPenalty: 0
        };
    });

    describe('generateResponse', () => {
        it('should generate a response with valid input', async () => {
            const prompt = 'Hello, AI!';
            const response = await aiService.generateResponse(prompt, defaultConfig);

            expect(response.content).toBe('Response to: Hello, AI!');
            expect(response.usage).toEqual({
                promptTokens: 10,
                completionTokens: 20,
                totalTokens: 30
            });
        });

        it('should throw error for empty prompt', async () => {
            await expect(aiService.generateResponse('', defaultConfig))
                .rejects.toThrow('Prompt cannot be empty');
        });

        it('should validate temperature range', async () => {
            const invalidConfig = { ...defaultConfig, temperature: 2.0 };
            await expect(aiService.generateResponse('test', invalidConfig))
                .rejects.toThrow('Temperature must be between 0 and 1');
        });

        it('should validate maxTokens', async () => {
            const invalidConfig = { ...defaultConfig, maxTokens: -1 };
            await expect(aiService.generateResponse('test', invalidConfig))
                .rejects.toThrow('MaxTokens must be positive');
        });
    });

    describe('validateConfig', () => {
        it('should validate valid config', () => {
            expect(() => aiService.validateConfig(defaultConfig)).not.toThrow();
        });

        it('should throw for invalid temperature', () => {
            expect(() => aiService.validateConfig({
                ...defaultConfig,
                temperature: -0.1
            })).toThrow();
        });

        it('should throw for invalid topP', () => {
            expect(() => aiService.validateConfig({
                ...defaultConfig,
                topP: 1.1
            })).toThrow();
        });
    });
});
