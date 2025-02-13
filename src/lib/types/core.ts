// src/lib/types/core.ts
export type Role = 'user' | 'assistant' | 'system';
export type ProviderKey = 'openai' | 'anthropic';

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}