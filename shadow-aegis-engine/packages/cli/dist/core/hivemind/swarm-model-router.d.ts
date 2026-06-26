/**
 * Swarm Model Router - Role-aware model resolution with epistemic trust tiers.
 *
 * Enables heterogeneous model assignment per worker role in the swarm.
 * Each role can be assigned a different LLM provider/model combination,
 * and the system automatically classifies the model's epistemic trust tier
 * for cross-agent claim filtering.
 */
import { type LanguageModel } from 'ai';
import { type AgentRole, type ModelTier } from './hivemind-schema.js';
export interface ModelOverride {
    apiKey?: string;
    model: string;
    provider: string;
}
export type SwarmModelOverrides = Partial<Record<AgentRole, ModelOverride>>;
/**
 * Classify a model into an epistemic trust tier.
 *
 * - `premium` (trust 0.9): Flagship models with deep reasoning.
 * - `standard` (trust 0.7): Capable mid-tier models.
 * - `local` (trust 0.5): Ollama/custom models, unknown quality.
 */
export declare function classifyModelTier(provider: string, model: string): ModelTier;
/**
 * Compute the trust score for a given model tier.
 */
export declare function computeTrustScore(tier: ModelTier): number;
/**
 * Resolve the LanguageModel for a given worker role.
 *
 * If `overrides[role]` is defined, instantiate a dedicated model for that role.
 * Otherwise, fall back to the shared default model.
 */
export declare function resolveWorkerModel(role: AgentRole, defaultModel: LanguageModel, overrides?: SwarmModelOverrides): LanguageModel;
/**
 * Resolve model tier information for a given role.
 */
export declare function resolveWorkerTier(role: AgentRole, defaultProvider: string, defaultModelName: string, overrides?: SwarmModelOverrides): {
    modelTier: ModelTier;
    trustScore: number;
};
/**
 * Clear the model cache. Used in tests.
 */
export declare function clearModelCache(): void;
