/**
 * Blackboard - Shared memory for multi-agent collaboration.
 */
import { type Result } from '../schema/base.js';
import { type AgentRegistration, type AgentRole, type ConflictMarker, type ConflictType, type EvidenceClaim, type EvidenceClaimStatus, type ModelTier, type Task } from './hivemind-schema.js';
import { TaskGraph } from './task-graph.js';
export interface BlackboardOptions {
    heartbeatTimeout?: number;
    runId: string;
    storagePath: string;
}
export type ClaimListener = (claim: EvidenceClaim) => void;
export type ConflictListener = (conflict: ConflictMarker) => void;
export type TaskListener = (task: Task) => void;
/**
 * Shared blackboard for multi-agent collaboration.
 */
export declare class Blackboard {
    private agents;
    private claims;
    private claimSubmittedListeners;
    private claimTypeListeners;
    private claimVerifiedListeners;
    private conflictCreatedListeners;
    private conflicts;
    private readonly heartbeatTimeout;
    private readonly runId;
    private readonly snapshotPath;
    private taskCompletedListeners;
    private readonly taskGraph;
    private constructor();
    /**
     * Create or load a blackboard.
     */
    static create(options: BlackboardOptions): Promise<Blackboard>;
    /**
     * Atomic claim and verify operation for cross-agent evidence flow.
     */
    claimAndVerify(taskId: string, claimId: string, verifyingAgentId: string): Result<{
        claim: EvidenceClaim;
        task: Task;
    }, string>;
    /**
     * Complete a task and notify listeners.
     */
    completeTask(taskId: string, result?: unknown): Result<Task, string>;
    /**
     * Contest a claim.
     */
    contestClaim(claimId: string, contestingAgentId: string, reason?: string): Result<EvidenceClaim, string>;
    /**
     * Create a conflict marker.
     */
    createConflict(conflictType: ConflictType, involvedAgents: string[], details?: {
        claimId?: string;
        reason?: string;
        taskId?: string;
    }): ConflictMarker;
    /**
     * Get all active agents.
     */
    getActiveAgents(): AgentRegistration[];
    /**
     * Get agents by role.
     */
    getAgentsByRole(role: AgentRole): AgentRegistration[];
    /**
     * Get claims filtered by minimum trust score.
     */
    getClaimsByMinTrust(minTrustScore: number): EvidenceClaim[];
    /**
     * Get claims by status.
     */
    getClaimsByStatus(status: EvidenceClaimStatus): EvidenceClaim[];
    /**
     * Get claims for an entity.
     */
    getClaimsForEntity(entityId: string): EvidenceClaim[];
    /**
     * Get open conflicts.
     */
    getOpenConflicts(): ConflictMarker[];
    /**
     * Get claims with skepticism annotations for cross-tier consumption.
     *
     * When a premium-tier agent reads claims from a lower-tier agent,
     * claims with trustScore < 0.8 are annotated with a warning prefix
     * in their data so the consuming agent treats them as unverified hints.
     */
    getSkepticismFilteredClaims(consumerTier: ModelTier): Array<EvidenceClaim & {
        skepticismNote?: string;
    }>;
    /**
     * Get the task graph.
     */
    getTaskGraph(): TaskGraph;
    /**
     * Update agent heartbeat.
     */
    heartbeat(agentId: string, status?: 'active' | 'busy' | 'idle' | 'offline'): Result<AgentRegistration, string>;
    onClaimSubmitted(callback: ClaimListener): () => void;
    onClaimVerified(callback: ClaimListener): () => void;
    onConflictCreated(callback: ConflictListener): () => void;
    onTaskCompleted(callback: TaskListener): () => void;
    /**
     * Mark inactive agents as offline.
     */
    pruneInactiveAgents(): void;
    /**
     * Register an agent.
     */
    registerAgent(role: AgentRole, capabilities?: string[]): Result<AgentRegistration, string>;
    /**
     * Resolve a conflict.
     */
    resolveConflict(conflictId: string, resolution: string): Result<ConflictMarker, string>;
    /**
     * Save blackboard state.
     */
    saveSnapshot(): Promise<void>;
    /**
     * Submit an evidence claim.
     */
    submitClaim(agentId: string, claimType: string, data: Record<string, unknown>, options?: {
        confidence?: number;
        entityId?: string;
        modelTier?: ModelTier;
        trustScore?: number;
    }): Result<EvidenceClaim, string>;
    subscribeToClaimType(claimType: string, callback: ClaimListener): () => void;
    /**
     * Verify a claim.
     */
    verifyClaim(claimId: string, verifyingAgentId: string): Result<EvidenceClaim, string>;
    private checkForClaimConflicts;
    private determineClaimStatus;
    /**
     * Load blackboard state.
     */
    private loadSnapshot;
}
