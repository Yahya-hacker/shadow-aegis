/**
 * Swarm Coordinator - Parallel multi-agent task and execution manager.
 */
import { type LanguageModel, type ToolSet } from 'ai';
import { type ShadowConfig } from '../../utils/config.js';
import { Blackboard } from './blackboard.js';
import { type AgentRole } from './hivemind-schema.js';
export interface SwarmCoordinatorOptions {
    allTools: ToolSet;
    auditMode?: string;
    config: ShadowConfig;
    diffScopeHint?: string;
    model: LanguageModel;
    runId: string;
    storagePath: string;
}
/**
 * Manages swarm orchestration, task dependency decomposition, parallel execution, and consensus flow.
 */
export declare class SwarmCoordinator {
    private readonly allTools;
    private readonly auditMode;
    private blackboard;
    private readonly config;
    private readonly diffScopeHint;
    private readonly model;
    private readonly runId;
    private readonly storagePath;
    private readonly workers;
    constructor(options: SwarmCoordinatorOptions);
    executeMission(userMessage: string, onActivity?: (workerRole: AgentRole, activity: {
        kind: string;
        message: string;
        toolName?: string;
    }) => void): Promise<string>;
    getBlackboard(): Blackboard;
}
