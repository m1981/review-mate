// src/lib/services/ai/OpenAIService.ts
import { Configuration, OpenAIApi } from 'openai';
import type {
    AIModelConfig,
    AIModelResponse,
    Provider,
    Message,
    Role
} from '';
import { AIServiceError } from '$lib/types';
import { BaseAIModelService } from './BaseAIModelService';
interface OpenAIConfig {
    apiKey: string;
    organization?: string;
}

export class OpenAIService extends BaseAIModelService {
    protected readonly provider: Provider = {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        maxTokens: {
            'gpt-4': 8192,
            'gpt-3.5-turbo': 4096
        },
        endpoints: ['https://api.openai.com/v1'],
        costs: {
            'gpt-4': { price: 0.03, unit: 1000 },
            'gpt-3.5-turbo': { price: 0.002, unit: 1000 }
        }
    };

    constructor(private readonly config: OpenAIConfig) {
        super();
        const configuration = new Configuration({
            apiKey: config.apiKey,
            organization: config.organization
        });
        this.api = new OpenAIApi(configuration);
    }

    // Public methods from IAIModelService interface
    public async generateResponse(
        prompt: string,
        config: AIModelConfig
    ): Promise<AIModelResponse> {
        const messages: Message[] = [{
            role: 'user' as Role,
            content: prompt
        }];
        return this.makeRequest(messages, config);
    }

    public async *streamResponse(
        prompt: string,
        config: AIModelConfig
    ): AsyncIterator<string> {
        const messages: Message[] = [{
            role: 'user' as Role,
            content: prompt
        }];
        yield* this.makeStreamRequest(messages, config);
    }

    // Additional public methods for chat history
    public async generateResponseWithHistory(
        messages: Message[],
        config: AIModelConfig
    ): Promise<AIModelResponse> {
        await this.validateMessages(messages);
        return this.makeRequest(messages, config);
    }

    public async *streamResponseWithHistory(
        messages: Message[],
        config: AIModelConfig
    ): AsyncIterator<string> {
        await this.validateMessages(messages);
        yield* this.makeStreamRequest(messages, config);
    }

    // Private implementation methods
    private async makeRequest(
        messages: Message[],
        config: AIModelConfig
    ): Promise<AIModelResponse> {
        try {
            await this.validateConfig(config);

            const response = await this.api.createChatCompletion({
                model: config.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                top_p: config.topP,
                presence_penalty: config.presencePenalty,
                frequency_penalty: config.frequencyPenalty
            });

            if (!response.data.choices[0]?.message?.content) {
                throw new AIServiceError(
                    'No content in response',
                    'EMPTY_RESPONSE'
                );
            }

            return {
                content: response.data.choices[0].message.content,
                usage: {
                    promptTokens: response.data.usage?.prompt_tokens || 0,
                    completionTokens: response.data.usage?.completion_tokens || 0,
                    totalTokens: response.data.usage?.total_tokens || 0
                }
            };
        } catch (error: any) {
            throw this.handleRequestError(error);
        }
    }

    private async *makeStreamRequest(
        messages: Message[],
        config: AIModelConfig
    ): AsyncIterator<string> {
        try {
            await this.validateConfig(config);

            const response = await this.api.createChatCompletion({
                model: config.modelName,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                temperature: config.temperature,
                max_tokens: config.maxTokens,
                top_p: config.topP,
                presence_penalty: config.presencePenalty,
                frequency_penalty: config.frequencyPenalty,
                stream: true
            }, { responseType: 'stream' });

            for await (const chunk of response.data) {
                const content = this.parseStreamChunk(chunk);
                if (content) yield content;
            }
        } catch (error) {
            throw this.handleStreamError(error);
        }
    }

    private parseStreamChunk(chunk: any): string | null {
        try {
            const lines = chunk
                .toString()
                .split('\n')
                .filter((line: string) => line.trim().startsWith('data: '));

            for (const line of lines) {
                const data = line.replace(/^data: /, '').trim();
                if (data === '[DONE]') return null;

                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content;
                if (content) return content;
            }
            return null;
        } catch {
            return null;
        }
    }

    private handleRequestError(error: unknown): AIServiceError {
        if (error instanceof AIServiceError) {
            return error;
        }

        const axiosError = error as any;
        if (axiosError.response?.status) {
            switch (axiosError.response.status) {
                case 401:
                    return new AIServiceError(
                        'Invalid API key',
                        'AUTHENTICATION_ERROR'
                    );
                case 429:
                    return new AIServiceError(
                        'Rate limit exceeded',
                        'RATE_LIMIT_ERROR'
                    );
                case 500:
                    return new AIServiceError(
                        'OpenAI service error',
                        'PROVIDER_ERROR'
                    );
            }
        }

        return new AIServiceError(
            'Request error occurred',
            'REQUEST_ERROR',
            error
        );
    }

    private handleStreamError(error: unknown): AIServiceError {
        if (error instanceof AIServiceError) {
            return error;
        }

        const axiosError = error as any;
        if (axiosError.response?.status) {
            switch (axiosError.response.status) {
                case 401:
                    return new AIServiceError(
                        'Invalid API key',
                        'AUTHENTICATION_ERROR'
                    );
                case 429:
                    return new AIServiceError(
                        'Rate limit exceeded',
                        'RATE_LIMIT_ERROR'
                    );
                case 500:
                    return new AIServiceError(
                        'OpenAI service error',
                        'PROVIDER_ERROR'
                    );
            }
        }

        return new AIServiceError(
            'Stream error occurred',
            'STREAM_ERROR',
            error
        );
    }

    private async validateMessages(messages: Message[]): Promise<void> {
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new AIServiceError(
                'Messages array cannot be empty',
                'INVALID_MESSAGES'
            );
        }

        const validRoles: Role[] = ['user', 'assistant', 'system'];
        for (const msg of messages) {
            if (!validRoles.includes(msg.role)) {
                throw new AIServiceError(
                    `Invalid role: ${msg.role}`,
                    'INVALID_ROLE'
                );
            }
            if (!msg.content?.trim()) {
                throw new AIServiceError(
                    'Message content cannot be empty',
                    'INVALID_CONTENT'
                );
            }
        }
    }

    protected async validateConfig(config: AIModelConfig): Promise<void> {
        await super.validateConfig(config);

    if (!this.provider.models.includes(config.modelName)) {
        throw new AIServiceError(
            `Invalid model name: ${config.modelName}`,
            'INVALID_CONFIG'
        );
    }

        const maxTokens = this.provider.maxTokens[config.modelName];
        if (config.maxTokens > maxTokens) {
            throw new AIServiceError(
                `Max tokens exceeds model limit of ${maxTokens}`,
                'INVALID_CONFIG'
            );
        }
    }

    public async validateApiKey(): Promise<boolean> {
        try {
        const response = await this.api.listModels();
        // Check if the response is valid
        return !!response?.data;
    } catch (error: any) {
        // Properly handle different error scenarios
        if (error?.response?.status === 401) {
            return false;
        }
        if (error?.message || error?.code) {
            return false;
        }
            return false;
        }
    }
}
