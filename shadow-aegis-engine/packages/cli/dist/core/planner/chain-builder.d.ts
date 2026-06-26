/**
 * Chain Builder - Constructs attack chains from knowledge graph analysis.
 */
import type { KnowledgeGraph } from '../memory/knowledge-graph.js';
import type { BaseEntity } from '../memory/memory-schema.js';
import type { Retrieval } from '../memory/retrieval.js';
import type { AttackCategory, AttackChain } from './planner-schema.js';
import { type Result } from '../schema/base.js';
import { AttackChainManager, AttackStepManager } from './attack-chain.js';
/**
 * Get attack category from CWE.
 */
export declare function cweToCategory(cwe: string): AttackCategory;
export interface ChainBuilderOptions {
    maxChainLength?: number;
    minConfidence?: number;
}
/**
 * Builds attack chains from knowledge graph data.
 */
export declare class ChainBuilder {
    private readonly chainManager;
    private readonly graph;
    private readonly options;
    private readonly retrieval;
    private readonly stepManager;
    constructor(graph: KnowledgeGraph, retrieval: Retrieval, options?: ChainBuilderOptions);
    /**
     * Build an attack chain from a single vulnerability.
     */
    buildChainFromVulnerability(vuln: BaseEntity): Promise<Result<AttackChain | null, string>>;
    /**
     * Build chains from data flow paths (source -> sink).
     */
    buildFromDataFlows(): Promise<Result<AttackChain[], string>>;
    /**
     * Build attack chains from discovered vulnerabilities.
     */
    buildFromVulnerabilities(): Promise<Result<AttackChain[], string>>;
    /**
     * Get the chain manager.
     */
    getChainManager(): AttackChainManager;
    /**
     * Get the step manager.
     */
    getStepManager(): AttackStepManager;
    /**
     * Build a chain from a specific data flow path.
     */
    private buildChainFromDataFlow;
    /**
     * Estimate impact score for attack category.
     */
    private estimateImpact;
    /**
     * Get CWE for sink category.
     */
    private getCweForSinkCategory;
    /**
     * Map sink category to attack category.
     */
    private sinkCategoryToAttackCategory;
}
