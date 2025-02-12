export interface AIModelConfig {
    modelName: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
}

export interface AIModelResponse {
    content: string;
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    }
}

export interface IAIModelService {
    generateResponse(prompt: string, config: AIModelConfig): Promise<AIModelResponse>;
    streamResponse(prompt: string, config: AIModelConfig): AsyncIterator<string>;
}
