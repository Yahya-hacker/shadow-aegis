/**
 * Credential Vault — OS Keychain Adapter with Environment Variable Fallback.
 *
 * Implements SecretStoreAdapter using a three-tier resolution chain:
 *   1. OS Keychain (cross-keychain): macOS Keychain, Windows Credential Manager, Linux Secret Service
 *   2. Environment Variables: SHADOW_{PROVIDER}_KEY (e.g. SHADOW_OPENAI_KEY)
 *   3. Plaintext config (handled transparently by config.ts when no adapter resolves)
 *
 * On headless CI/Linux without a desktop secret service, the keychain import
 * fails gracefully and the adapter falls through to env vars — never crashes.
 */
import type { SecretStoreAdapter } from './config.js';
declare const SERVICE_NAME = "shadow-auditor";
/** Maps provider names to their conventional environment variable names. */
declare const ENV_VAR_MAP: Record<string, string>;
declare function getApiKeyFromEnv(provider: string): null | string;
/**
 * Production-grade SecretStoreAdapter.
 *
 * Resolution order for getApiKey:
 *   1. OS Keychain (if available)
 *   2. Environment variable (SHADOW_{PROVIDER}_KEY)
 *   3. Returns null → config.ts falls back to plaintext JSON
 *
 * setApiKey always tries the OS keychain first; silently skips on failure.
 */
export declare class KeychainAdapter implements SecretStoreAdapter {
    /**
     * Retrieve an API key for the given provider.
     */
    getApiKey(provider: string): Promise<null | string>;
    /**
     * Store an API key in the OS keychain.
     * Silently no-ops if the keychain is unavailable.
     */
    setApiKey(provider: string, apiKey: string): Promise<void>;
}
export { ENV_VAR_MAP, getApiKeyFromEnv, SERVICE_NAME };
