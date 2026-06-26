import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
const CONFIG_FILENAME = '.shadow-auditor.json';
let plaintextApiKeyWarningShown = false;
let secretStoreAdapter = null;
export function registerSecretStoreAdapter(adapter) {
    secretStoreAdapter = adapter;
}
/**
 * Resolves the absolute path to the global config file
 */
function getConfigPath() {
    return path.join(os.homedir(), CONFIG_FILENAME);
}
/**
 * Loads the Shadow Auditor configuration from ~/.shadow-auditor.json
 * Returns null if the file doesn't exist or is invalid
 */
export async function loadConfig() {
    const configPath = getConfigPath();
    try {
        const raw = await fs.readFile(configPath, 'utf8');
        const parsed = JSON.parse(raw);
        // Validate essential fields
        if (!parsed.provider || !parsed.model) {
            return null;
        }
        // API key is required for non-Ollama providers
        if (parsed.provider !== 'ollama' && !parsed.apiKey && secretStoreAdapter) {
            const secureApiKey = await secretStoreAdapter.getApiKey(parsed.provider);
            if (secureApiKey) {
                parsed.apiKey = secureApiKey;
            }
        }
        if (parsed.provider !== 'ollama' && !parsed.apiKey) {
            return null;
        }
        if (parsed.provider !== 'ollama' && parsed.apiKey && !plaintextApiKeyWarningShown) {
            plaintextApiKeyWarningShown = true;
            console.warn(`[SHADOW-AUDITOR][WARN] API key is stored in plaintext at ${configPath}. ` +
                'Consider using environment variables or registerSecretStoreAdapter(...) for keychain integration.');
        }
        return parsed;
    }
    catch {
        return null;
    }
}
/**
 * Saves the Shadow Auditor configuration to ~/.shadow-auditor.json
 */
export async function saveConfig(configData) {
    const configPath = getConfigPath();
    if (configData.provider !== 'ollama' && configData.apiKey && secretStoreAdapter?.setApiKey) {
        await secretStoreAdapter.setApiKey(configData.provider, configData.apiKey);
        const { apiKey: _apiKey, ...configWithoutApiKey } = configData;
        const json = JSON.stringify(configWithoutApiKey, null, 2);
        await fs.writeFile(configPath, json, 'utf-8');
        return;
    }
    const json = JSON.stringify(configData, null, 2);
    await fs.writeFile(configPath, json, 'utf-8');
}
