/**
 * Worker Prompts - Role-specific system prompts for swarm workers.
 */
import { type AgentRole, type ModelTier } from './hivemind-schema.js';
/**
 * Builds a highly tailored system prompt for a specialized agent worker role.
 */
export declare function buildWorkerSystemPrompt(role: AgentRole, options?: {
    auditMode?: string;
    diffScope?: string;
    modelTier?: ModelTier;
}): string;
