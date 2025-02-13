export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface ConversationContext {
    messages: Message[];
    tokenCount: number;
    modelConfig: AIModelConfig;
}
