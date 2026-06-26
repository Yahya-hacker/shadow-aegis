import { type LanguageModel } from 'ai';
import type { ShadowConfig } from '../utils/config.js';
/**
 * Returns the correct model instance based on provider configuration.
 */
export declare function getModel(config: ShadowConfig): LanguageModel;
