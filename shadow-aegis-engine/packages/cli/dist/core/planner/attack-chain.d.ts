/**
 * Attack Chain - Core attack chain data structure and operations.
 */
import { type Result } from '../schema/base.js';
import { type AttackCategory, type AttackChain, type AttackStep, type AttackStepStatus, type ChainRankingWeights } from './planner-schema.js';
export interface AttackStepInput {
    attackCategory: AttackCategory;
    cwe: string;
    description: string;
    entityIds?: string[];
    feasibility?: number;
    impact?: number;
    prerequisites?: string[];
    title: string;
}
/**
 * Manages attack steps and their relationships.
 */
export declare class AttackStepManager {
    private steps;
    /**
     * Create a new attack step.
     */
    createStep(input: AttackStepInput): Result<AttackStep, string>;
    /**
     * Export steps for persistence.
     */
    exportSteps(): AttackStep[];
    /**
     * Get all steps.
     */
    getAllSteps(): AttackStep[];
    /**
     * Get a step by ID.
     */
    getStep(stepId: string): AttackStep | undefined;
    /**
     * Get steps by status.
     */
    getStepsByStatus(status: AttackStepStatus): AttackStep[];
    /**
     * Get steps that can be verified (no unverified prerequisites).
     */
    getVerifiableSteps(): AttackStep[];
    /**
     * Check if a step has cyclic dependencies.
     */
    hasCyclicDependency(stepId: string, visited?: Set<string>): boolean;
    /**
     * Import steps from persistence.
     */
    importSteps(steps: AttackStep[]): void;
    /**
     * Link entity to step.
     */
    linkEntity(stepId: string, entityId: string): Result<AttackStep, string>;
    /**
     * Update step confidence based on new evidence.
     */
    updateStepConfidence(stepId: string, confidence: number, evidenceId?: string): Result<AttackStep, string>;
    /**
     * Update step status.
     */
    updateStepStatus(stepId: string, status: AttackStepStatus): Result<AttackStep, string>;
}
/**
 * Manages attack chains built from steps.
 */
export declare class AttackChainManager {
    private chains;
    private readonly stepManager;
    constructor(stepManager: AttackStepManager);
    /**
     * Create a new attack chain from steps.
     */
    createChain(title: string, description: string, stepIds: string[]): Result<AttackChain, string>;
    /**
     * Export chains for persistence.
     */
    exportChains(): AttackChain[];
    /**
     * Get all chains.
     */
    getAllChains(): AttackChain[];
    /**
     * Get a chain by ID.
     */
    getChain(chainId: string): AttackChain | undefined;
    /**
     * Get hypothesized (unverified) chains.
     */
    getHypothesizedChains(): AttackChain[];
    /**
     * Get chains ranked by score.
     */
    getRankedChains(weights?: ChainRankingWeights): AttackChain[];
    /**
     * Get verified chains.
     */
    getVerifiedChains(): AttackChain[];
    /**
     * Import chains from persistence.
     */
    importChains(chains: AttackChain[]): void;
    /**
     * Update chain after step changes.
     */
    refreshChain(chainId: string): Result<AttackChain, string>;
    /**
     * Calculate chain metrics from steps.
     */
    private calculateChainMetrics;
    /**
     * Determine chain status from steps.
     */
    private determineChainStatus;
}
