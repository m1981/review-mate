// src/lib/types/errors.ts
export type AIServiceErrorType =
    | 'AUTHENTICATION_ERROR'
    | 'RATE_LIMIT_ERROR'
    | 'PROVIDER_ERROR'
    | 'REQUEST_ERROR'
    | 'STREAM_ERROR'
    | 'EMPTY_RESPONSE'
    | 'INVALID_CONFIG'
    | 'INVALID_MESSAGES'
    | 'INVALID_ROLE'
    | 'INVALID_CONTENT';

export class AIServiceError extends Error {
    constructor(
        message: string,
        public readonly type: AIServiceErrorType,
        public readonly cause?: unknown
    ) {
        super(message);
        this.name = 'AIServiceError';

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AIServiceError);
        }
    }

    public toJSON() {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            cause: this.cause,
            stack: this.stack
        };
    }
}

export function isAIServiceError(error: unknown): error is AIServiceError {
    return error instanceof AIServiceError;
}

export function createAIServiceError(
    type: AIServiceErrorType,
    message?: string,
    cause?: unknown
): AIServiceError {
    const defaultMessages: Record<AIServiceErrorType, string> = {
        AUTHENTICATION_ERROR: 'Authentication failed',
        RATE_LIMIT_ERROR: 'Rate limit exceeded',
        PROVIDER_ERROR: 'Provider service error',
        REQUEST_ERROR: 'Request failed',
        STREAM_ERROR: 'Stream error occurred',
        EMPTY_RESPONSE: 'Empty response received',
        INVALID_CONFIG: 'Invalid configuration',
        INVALID_MESSAGES: 'Invalid messages',
        INVALID_ROLE: 'Invalid role',
        INVALID_CONTENT: 'Invalid content'
    };

    return new AIServiceError(
        message || defaultMessages[type],
        type,
        cause
    );
}
