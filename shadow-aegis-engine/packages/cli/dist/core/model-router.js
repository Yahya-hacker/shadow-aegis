import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';
/**
 * Returns the correct model instance based on provider configuration.
 */
export function getModel(config) {
    const { apiKey, customBaseUrl, model, provider } = config;
    const normalizedProvider = provider.trim().toLowerCase();
    switch (normalizedProvider) {
        case 'anthropic': {
            const anthropic = createAnthropic({ apiKey });
            return anthropic(model);
        }
        case 'custom': {
            const customProvider = createOpenAI({
                apiKey,
                baseURL: customBaseUrl,
            });
            return customProvider(model);
        }
        case 'google': {
            const google = createGoogleGenerativeAI({ apiKey });
            return google(model);
        }
        case 'mistral': {
            const mistral = createMistral({ apiKey });
            return mistral(model);
        }
        case 'ollama': {
            const ollama = createOllama();
            return ollama(model);
        }
        case 'openai': {
            const openai = createOpenAI({ apiKey });
            return openai(model);
        }
        default: {
            throw new Error(`[SHADOW-AUDITOR] Unknown provider: "${provider}". Supported: anthropic, openai, google, mistral, ollama, custom.`);
        }
    }
}
