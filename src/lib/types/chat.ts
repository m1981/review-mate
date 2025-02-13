export interface Message {
    role: Role;
    content: string;
}

export interface ChatMessage extends BaseEntity, Message {
    conversationId: string;
}

export interface Conversation extends BaseEntity {
    userId: string;
    folderId?: string;
    title: string;
    titleSet: boolean;
    tokenCount: number;
}