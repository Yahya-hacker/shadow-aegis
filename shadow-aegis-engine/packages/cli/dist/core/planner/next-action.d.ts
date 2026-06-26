/**
 * Next Action - Action recommendation engine for attack chain verification.
 */
import type { KnowledgeGraph } from '../memory/knowledge-graph.js';
import type { AttackChainManager, AttackStepManager } from './attack-chain.js';
import type { AttackChain, AttackStep, PlannerAction } from './planner-schema.js';
export interface ActionRecommendation {
    action: PlannerAction;
    chain?: AttackChain;
    step?: AttackStep;
}
export interface NextActionOptions {
    focusChainId?: string;
    maxRecommendations?: number;
    preferVerification?: boolean;
}
/**
 * Recommends next actions for attack chain verification.
 */
export declare class NextActionPlanner {
    private readonly stepManager;
    private readonly chainManager;
    private readonly graph;
    constructor(stepManager: AttackStepManager, chainManager: AttackChainManager, graph: KnowledgeGraph);
    /**
     * Get single best next action.
     */
    getBestAction(options?: NextActionOptions): ActionRecommendation | null;
    /**
     * Get actions for a specific chain.
     */
    getChainActions(chainId: string): ActionRecommendation[];
    /**
     * Get recommended next actions.
     */
    getRecommendations(options?: NextActionOptions): ActionRecommendation[];
    /**
     * Check if a step can be verified.
     */
    private canVerifyStep;
    /**
     * Create a collect evidence action.
     */
    private createCollectEvidenceAction;
    /**
     * Create a find sinks action.
     */
    private createFindSinksAction;
    /**
     * Create a find sources action.
     */
    private createFindSourcesAction;
    /**
     * Create a trace flow action.
     */
    private createTraceFlowAction;
    /**
     * Create a verify step action.
     */
    private createVerifyStepAction;
    /**
     * Generate unique action ID.
     */
    private generateActionId;
    /**
     * Rank chains by exploitation potential.
     */
    private rankChainsByPotential;
    /**
     * Rank steps by verification priority.
     */
    private rankStepsByPriority;
}
