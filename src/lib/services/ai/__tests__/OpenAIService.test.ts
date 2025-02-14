// src/lib/services/ai/__tests__/OpenAIService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIService } from '../OpenAIService';
import { Configuration, OpenAIApi } from 'openai';
import { AIServiceError } from '$lib/types';
// Mock OpenAI
vi.mock('openai', () => {
    const Configuration = vi.fn();
    const OpenAIApi = vi.fn();
    return { Configuration, OpenAIApi };
});

describe('OpenAIService', () => {
    let openAIService: OpenAIService;
    let mockCreateChatCompletion: ReturnType<typeof vi.fn>;

    const defaultConfig = {
        modelName: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 100,
        topP: 1,
        presencePenalty: 0,
        frequencyPenalty: 0
    };

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Setup mock response
        mockCreateChatCompletion = vi.fn();
        (OpenAIApi as any).mockImplementation(() => ({
            createChatCompletion: mockCreateChatCompletion,
            listModels: vi.fn()
        }));

        // Create service instance
        openAIService = new OpenAIService({
            apiKey: 'test-key'
        });
    });

    describe('generateResponse', () => {
        it('should generate response successfully', async () => {
            // Mock successful response
            mockCreateChatCompletion.mockResolvedValue({
                data: {
                    choices: [{
                        message: {
                            content: 'Test response'
                        }
                    }],
                    usage: {
                        prompt_tokens: 10,
                        completion_tokens: 20,
                        total_tokens: 30
                    }
                }
            });

            const response = await openAIService.generateResponse(
                'Test prompt',
                defaultConfig
            );

            expect(response).toEqual({
                content: 'Test response',
                usage: {
                    promptTokens: 10,
                    completionTokens: 20,
                    totalTokens: 30
                }
            });

            // Verify API was called with correct parameters
            expect(mockCreateChatCompletion).toHaveBeenCalledWith({
                model: defaultConfig.modelName,
                messages: [{
                    role: 'user',
                    content: 'Test prompt'
                }],
                temperature: defaultConfig.temperature,
                max_tokens: defaultConfig.maxTokens,
                top_p: defaultConfig.topP,
                presence_penalty: defaultConfig.presencePenalty,
                frequency_penalty: defaultConfig.frequencyPenalty
            });
        });

        it('should handle authentication error', async () => {
            mockCreateChatCompletion.mockRejectedValue({
                response: {
                    status: 401,
                    data: { error: 'Invalid API key' }
                }
            });

            await expect(openAIService.generateResponse(
                'Test prompt',
                defaultConfig
            )).rejects.toThrow(AIServiceError);
        });

        it('should handle rate limit error', async () => {
            mockCreateChatCompletion.mockRejectedValue({
                response: {
                    status: 429,
                    data: { error: 'Rate limit exceeded' }
                }
            });

            await expect(openAIService.generateResponse(
                'Test prompt',
                defaultConfig
            )).rejects.toThrow(AIServiceError);
        });

        it('should handle empty response', async () => {
            mockCreateChatCompletion.mockResolvedValue({
                data: {
                    choices: []
                }
            });

            await expect(openAIService.generateResponse(
                'Test prompt',
                defaultConfig
            )).rejects.toThrow(AIServiceError);
        });
    });

    describe('validateConfig', () => {
        it('should validate correct config', async () => {
        await expect(openAIService.validateConfig(defaultConfig))
            .resolves.toBeUndefined();
    });

    it('should throw for invalid temperature', async () => {
        const invalidConfig = {
            ...defaultConfig,
            temperature: 2.0
        };
        await expect(openAIService.validateConfig(invalidConfig))
            .rejects.toThrow('Temperature must be between 0 and 1');
    });

    it('should throw for invalid topP', async () => {
        const invalidConfig = {
            ...defaultConfig,
            topP: 1.1
        };
        await expect(openAIService.validateConfig(invalidConfig))
            .rejects.toThrow('TopP must be between 0 and 1');
    });

    it('should throw for invalid maxTokens', async () => {
        const invalidConfig = {
            ...defaultConfig,
            maxTokens: -1
        };
        await expect(openAIService.validateConfig(invalidConfig))
            .rejects.toThrow('MaxTokens must be positive');
    });

    it('should throw for invalid model name', async () => {
        const invalidConfig = {
            ...defaultConfig,
            modelName: ''
        };
        await expect(openAIService.validateConfig(invalidConfig))
            .rejects.toThrow('Model name must be specified');
        });

    it('should throw for invalid presence penalty', async () => {
            const invalidConfig = {
                ...defaultConfig,
            presencePenalty: 3
            };

            await expect(openAIService['validateConfig'](invalidConfig))
                .rejects.toThrow(AIServiceError);
        });

        it('should reject invalid token limit', async () => {
            const invalidConfig = {
                ...defaultConfig,
                maxTokens: 10000
            };

            await expect(openAIService['validateConfig'](invalidConfig))
                .rejects.toThrow(AIServiceError);
        });
    });

    describe('validateApiKey', () => {
        it('should return true for valid API key', async () => {
            // Create a new instance with specific mock for this test
            const mockListModels = vi.fn().mockResolvedValue({
                data: {
                    data: [{ id: 'model-1' }]
                }
            });

            (OpenAIApi as any).mockImplementation(() => ({
                listModels: mockListModels,
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new OpenAIService({
                apiKey: 'valid-key'
            });

            const result = await service.validateApiKey();
            expect(result).toBe(true);
        });

        it('should return false for invalid API key', async () => {
            // Create a new instance with specific mock for this test
            const mockListModels = vi.fn().mockRejectedValue({
                response: {
                    status: 401,
                    data: { error: 'Invalid API key' }
                }
            });

            (OpenAIApi as any).mockImplementation(() => ({
                listModels: mockListModels,
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new OpenAIService({
                apiKey: 'invalid-key'
            });

            const result = await service.validateApiKey();
            expect(result).toBe(false);
        });

        it('should return false for network error', async () => {
            // Create a new instance with specific mock for this test
            const mockListModels = vi.fn().mockRejectedValue({
                message: 'Network Error',
                code: 'ECONNREFUSED'
            });

            (OpenAIApi as any).mockImplementation(() => ({
                listModels: mockListModels,
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new OpenAIService({
                apiKey: 'test-key'
            });

            const result = await service.validateApiKey();
            expect(result).toBe(false);
        });

        it('should return false for unexpected error', async () => {
            // Create a new instance with specific mock for this test
            const mockListModels = vi.fn().mockRejectedValue(new Error('Unexpected error'));

            (OpenAIApi as any).mockImplementation(() => ({
                listModels: mockListModels,
                createChatCompletion: mockCreateChatCompletion
            }));

            const service = new OpenAIService({
                apiKey: 'test-key'
            });

            const result = await service.validateApiKey();
            expect(result).toBe(false);
        });
    });
});

