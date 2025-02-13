export interface ModelConfig {
    model: string;
    maxTokens: number;
    temperature: number;
    presencePenalty: number;
    topP: number;
    frequencyPenalty: number;
}

export interface ChatConfig {
    provider: ProviderKey;
    modelConfig: ModelConfig;
}

export interface Message {
    id: string;
    role: Role;
    content: string;
    timestamp: Date;
}

export interface Chat {
    id: string;
    title: string;
    folderId?: string;
    messages: Message[];
    config: ChatConfig;
    titleSet: boolean;
    tokenCount: number;
    createdAt: Date;
    updatedAt: Date;
}
