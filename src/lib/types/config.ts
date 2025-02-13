export interface UserConfig {
    theme: 'light' | 'dark' | 'system';
    autoTitle: boolean;
    enterToSubmit: boolean;
    defaultProvider: ProviderKey;
    defaultModel: string;
    defaultSystemPrompt?: string;
}