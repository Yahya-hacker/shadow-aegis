/**
 * Mission Engine - Core orchestration logic for OODA loop execution.
 */
import { EventStore } from '../memory/event-store.js';
import { KnowledgeGraph } from '../memory/knowledge-graph.js';
import { Retrieval } from '../memory/retrieval.js';
import { type Result } from '../schema/base.js';
import { type Hypothesis, type MissionObjective, type MissionPhase, type MissionState, type PendingAction } from './mission-state.js';
import { type TransitionContext } from './transitions.js';
export interface MissionEngineOptions {
    maxTokens?: number;
    maxToolCalls?: number;
    runId: string;
    storagePath: string;
}
export interface PhaseHandler {
    execute: (engine: MissionEngine, state: MissionState) => Promise<PhaseResult>;
    phase: MissionPhase;
}
export interface PhaseResult {
    context: TransitionContext;
    nextPhase: MissionPhase;
    reason: import('./mission-state.js').TransitionReason;
}
/**
 * Core mission orchestration engine.
 */
export declare class MissionEngine {
    private checkpointManager;
    private eventStore;
    private graph;
    private initialized;
    private readonly options;
    private phaseHandlers;
    private retrieval;
    private state;
    constructor(options: MissionEngineOptions);
    /**
     * Add a hypothesis to the mission.
     */
    addHypothesis(hypothesis: Omit<Hypothesis, 'createdAt' | 'hypothesisId' | 'updatedAt'>): Hypothesis;
    /**
     * Check if tool execution is allowed in current phase.
     */
    canExecuteTool(): boolean;
    /**
     * Mark action as completed.
     */
    completeAction(actionId: string, tokensUsed?: number): void;
    /**
     * Get the event store.
     */
    getEventStore(): EventStore;
    /**
     * Get the knowledge graph.
     */
    getGraph(): KnowledgeGraph;
    /**
     * Get next action to execute.
     */
    getNextAction(): null | PendingAction;
    /**
     * Get remaining budget.
     */
    getRemainingBudget(): {
        tokens: number;
        toolCalls: number;
    };
    /**
     * Get the retrieval service.
     */
    getRetrieval(): Retrieval;
    /**
     * Get current mission state.
     */
    getState(): MissionState;
    /**
     * Initialize the engine, optionally resuming from checkpoint.
     */
    initialize(objectives?: MissionObjective[]): Promise<void>;
    /**
     * Queue an action for execution.
     */
    queueAction(action: Omit<PendingAction, 'actionId'>): PendingAction;
    /**
     * Register a phase handler.
     */
    registerPhaseHandler(handler: PhaseHandler): void;
    /**
     * Run the full OODA loop until completion or budget exhaustion.
     */
    run(): Promise<Result<MissionState, string>>;
    /**
     * Save a checkpoint.
     */
    saveCheckpoint(): Promise<void>;
    /**
     * Execute one OODA loop iteration.
     */
    step(): Promise<Result<{
        completed: boolean;
        phase: MissionPhase;
    }, string>>;
    /**
     * Manually transition to a new phase.
     */
    transition(targetPhase: MissionPhase, reason: import('./mission-state.js').TransitionReason, context: TransitionContext): Promise<Result<void, string>>;
    /**
     * Update hypothesis status.
     */
    updateHypothesis(hypothesisId: string, updates: Partial<Pick<Hypothesis, 'confidence' | 'evidenceIds' | 'status'>>): Result<Hypothesis, string>;
    private createInitialState;
    private ensureInitialized;
    private recordEvent;
    private shouldCheckpoint;
}
