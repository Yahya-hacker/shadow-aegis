/**
 * Agent Worker - Autonomous specialized worker with private OODA loop.
 */
import { type LanguageModel, type ToolSet } from 'ai';
import { type Blackboard } from './blackboard.js';
import { type AgentRole, type ModelTier, type Task } from './hivemind-schema.js';
export interface AgentWorkerOptions {
    agentId: string;
    allTools: ToolSet;
    auditMode?: string;
    blackboard: Blackboard;
    diffScopeHint?: string;
    maxOutputTokens?: number;
    maxToolSteps?: number;
    model: LanguageModel;
    modelTier?: ModelTier;
    role: AgentRole;
    trustScore?: number;
}
/**
 * An autonomous agent worker representing a specialized role in the multi-agent swarm.
 */
export declare class AgentWorker {
    readonly agentId: string;
    readonly modelTier: ModelTier;
    readonly role: AgentRole;
    readonly trustScore: number;
    private readonly auditMode;
    private readonly blackboard;
    private readonly cleanupCallbacks;
    private readonly diffScopeHint;
    private heartbeatInterval?;
    private isTerminated;
    private readonly maxOutputTokens;
    private readonly maxToolSteps;
    private readonly messages;
    private readonly model;
    private readonly systemPrompt;
    private readonly tools;
    constructor(options: AgentWorkerOptions);
    /**
     * Register a cleanup callback (e.g., unsubscribing from blackboard pub/sub).
     */
    addCleanupCallback(callback: () => void): void;
    /**
     * Run the worker OODA micro-loop on a claimed task.
     */
    executeTask(task: Task, onActivity?: (activity: {
        kind: string;
        message: string;
        toolName?: string;
    }) => void): Promise<string>;
    /**
     * Terminate the worker.
     */
    terminate(): void;
}
