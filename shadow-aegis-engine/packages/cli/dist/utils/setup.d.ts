import type { ShadowConfig } from './config.js';
/**
 * Runs the interactive setup wizard using React/Ink if configuration is missing or forced via --reconfigure.
 * Returns the validated configuration object.
 */
export declare function runSetupWizard(forceReconfigure?: boolean): Promise<ShadowConfig>;
/**
 * Returns a helpful placeholder for the model input based on the selected provider
 */
export declare function getModelPlaceholder(provider: string): string;
