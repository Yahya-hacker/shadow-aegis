/**
 * Blackboard - Shared memory for multi-agent collaboration.
 */
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { err, ok, safeParseJson } from '../schema/base.js';
import { agentRegistrationSchema, blackboardStateSchema, evidenceClaimSchema, } from './hivemind-schema.js';
import { TaskGraph } from './task-graph.js';
/**
 * Shared blackboard for multi-agent collaboration.
 */
export class Blackboard {
    agents = new Map();
    claims = new Map();
    claimSubmittedListeners = new Set();
    claimTypeListeners = new Map();
    claimVerifiedListeners = new Set();
    conflictCreatedListeners = new Set();
    conflicts = new Map();
    heartbeatTimeout;
    runId;
    snapshotPath;
    taskCompletedListeners = new Set();
    taskGraph;
    constructor(options) {
        this.runId = options.runId;
        this.snapshotPath = path.join(options.storagePath, 'blackboard.json');
        this.heartbeatTimeout = options.heartbeatTimeout ?? 60_000;
        this.taskGraph = new TaskGraph();
    }
    /**
     * Create or load a blackboard.
     */
    static async create(options) {
        await fs.mkdir(options.storagePath, { recursive: true });
        const blackboard = new Blackboard(options);
        await blackboard.loadSnapshot();
        return blackboard;
    }
    /**
     * Atomic claim and verify operation for cross-agent evidence flow.
     */
    claimAndVerify(taskId, claimId, verifyingAgentId) {
        const claimRes = this.verifyClaim(claimId, verifyingAgentId);
        if (!claimRes.ok) {
            return err(claimRes.error);
        }
        const taskRes = this.taskGraph.claimTask(taskId, verifyingAgentId);
        if (!taskRes.ok) {
            return err(taskRes.error);
        }
        return ok({ claim: claimRes.value, task: taskRes.value });
    }
    // ==========================================================================
    // Agent Management
    // ==========================================================================
    /**
     * Complete a task and notify listeners.
     */
    completeTask(taskId, result) {
        const res = this.taskGraph.completeTask(taskId, result);
        if (res.ok) {
            for (const listener of this.taskCompletedListeners) {
                listener(res.value);
            }
        }
        return res;
    }
    /**
     * Contest a claim.
     */
    contestClaim(claimId, contestingAgentId, reason) {
        const claim = this.claims.get(claimId);
        if (!claim) {
            return err(`Claim not found: ${claimId}`);
        }
        if (contestingAgentId === claim.agentId) {
            return err('Agent cannot contest its own claim');
        }
        const updated = {
            ...claim,
            contestedBy: [...claim.contestedBy, contestingAgentId],
            status: this.determineClaimStatus(claim.verifiedBy.length, claim.contestedBy.length + 1),
        };
        this.claims.set(claimId, updated);
        // Create conflict marker
        this.createConflict('contradictory_evidence', [claim.agentId, contestingAgentId], {
            claimId,
            reason,
        });
        return ok(updated);
    }
    /**
     * Create a conflict marker.
     */
    createConflict(conflictType, involvedAgents, details = {}) {
        const now = new Date().toISOString();
        const conflictId = `conflict_${crypto.randomBytes(8).toString('hex')}`;
        const conflict = {
            conflictId,
            conflictType,
            createdAt: now,
            description: details.reason ?? `${conflictType} between agents`,
            involvedAgents,
            relatedClaims: details.claimId ? [details.claimId] : [],
            relatedTasks: details.taskId ? [details.taskId] : [],
            status: 'open',
        };
        this.conflicts.set(conflictId, conflict);
        // Notify listeners
        for (const listener of this.conflictCreatedListeners) {
            listener(conflict);
        }
        return conflict;
    }
    /**
     * Get all active agents.
     */
    getActiveAgents() {
        const now = Date.now();
        return [...this.agents.values()].filter((agent) => {
            const lastHeartbeat = new Date(agent.lastHeartbeat).getTime();
            return now - lastHeartbeat < this.heartbeatTimeout && agent.status !== 'offline';
        });
    }
    /**
     * Get agents by role.
     */
    getAgentsByRole(role) {
        return this.getActiveAgents().filter((agent) => agent.role === role);
    }
    /**
     * Get claims filtered by minimum trust score.
     */
    getClaimsByMinTrust(minTrustScore) {
        return [...this.claims.values()].filter((c) => c.trustScore >= minTrustScore);
    }
    /**
     * Get claims by status.
     */
    getClaimsByStatus(status) {
        return [...this.claims.values()].filter((c) => c.status === status);
    }
    /**
     * Get claims for an entity.
     */
    getClaimsForEntity(entityId) {
        return [...this.claims.values()].filter((c) => c.entityId === entityId);
    }
    /**
     * Get open conflicts.
     */
    getOpenConflicts() {
        return [...this.conflicts.values()].filter((c) => c.status === 'open' || c.status === 'resolving');
    }
    /**
     * Get claims with skepticism annotations for cross-tier consumption.
     *
     * When a premium-tier agent reads claims from a lower-tier agent,
     * claims with trustScore < 0.8 are annotated with a warning prefix
     * in their data so the consuming agent treats them as unverified hints.
     */
    getSkepticismFilteredClaims(consumerTier) {
        const trustThreshold = consumerTier === 'premium' ? 0.8 : 0.5;
        return [...this.claims.values()].map((claim) => {
            if (claim.trustScore < trustThreshold) {
                return {
                    ...claim,
                    skepticismNote: `[UNVERIFIED HINT — trustScore: ${claim.trustScore}, tier: ${claim.modelTier}] Verify with tools before relying on this data.`,
                };
            }
            return { ...claim };
        });
    }
    // ==========================================================================
    // Evidence Claims
    // ==========================================================================
    /**
     * Get the task graph.
     */
    getTaskGraph() {
        return this.taskGraph;
    }
    /**
     * Update agent heartbeat.
     */
    heartbeat(agentId, status) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return err(`Agent not found: ${agentId}`);
        }
        const updated = {
            ...agent,
            lastHeartbeat: new Date().toISOString(),
            status: status ?? agent.status,
        };
        this.agents.set(agentId, updated);
        return ok(updated);
    }
    onClaimSubmitted(callback) {
        this.claimSubmittedListeners.add(callback);
        return () => this.claimSubmittedListeners.delete(callback);
    }
    onClaimVerified(callback) {
        this.claimVerifiedListeners.add(callback);
        return () => this.claimVerifiedListeners.delete(callback);
    }
    onConflictCreated(callback) {
        this.conflictCreatedListeners.add(callback);
        return () => this.conflictCreatedListeners.delete(callback);
    }
    // ==========================================================================
    // Conflict Management
    // ==========================================================================
    onTaskCompleted(callback) {
        this.taskCompletedListeners.add(callback);
        return () => this.taskCompletedListeners.delete(callback);
    }
    /**
     * Mark inactive agents as offline.
     */
    pruneInactiveAgents() {
        const now = Date.now();
        for (const [agentId, agent] of this.agents) {
            const lastHeartbeat = new Date(agent.lastHeartbeat).getTime();
            if (now - lastHeartbeat >= this.heartbeatTimeout && agent.status !== 'offline') {
                this.agents.set(agentId, { ...agent, status: 'offline' });
            }
        }
    }
    /**
     * Register an agent.
     */
    registerAgent(role, capabilities = []) {
        const now = new Date().toISOString();
        const agentId = `agent_${role}_${crypto.randomBytes(4).toString('hex')}`;
        const registration = {
            agentId,
            capabilities,
            lastHeartbeat: now,
            registeredAt: now,
            role,
            status: 'idle',
        };
        const validation = agentRegistrationSchema.safeParse(registration);
        if (!validation.success) {
            return err(`Invalid registration: ${validation.error.message}`);
        }
        this.agents.set(agentId, registration);
        return ok(registration);
    }
    // ==========================================================================
    // Persistence
    // ==========================================================================
    /**
     * Resolve a conflict.
     */
    resolveConflict(conflictId, resolution) {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) {
            return err(`Conflict not found: ${conflictId}`);
        }
        const updated = {
            ...conflict,
            resolution,
            resolvedAt: new Date().toISOString(),
            status: 'resolved',
        };
        this.conflicts.set(conflictId, updated);
        return ok(updated);
    }
    /**
     * Save blackboard state.
     */
    async saveSnapshot() {
        const state = {
            agents: [...this.agents.values()],
            claims: [...this.claims.values()],
            conflicts: [...this.conflicts.values()],
            consensusRecords: [], // Persisted via dedicated consensus manager flow.
            runId: this.runId,
            schemaVersion: '1.0.0',
            snapshotAt: new Date().toISOString(),
            tasks: this.taskGraph.exportTasks(),
        };
        const validation = blackboardStateSchema.safeParse(state);
        if (!validation.success) {
            throw new Error(`Invalid blackboard state: ${validation.error.message}`);
        }
        await fs.writeFile(this.snapshotPath, JSON.stringify(state, null, 2), 'utf8');
    }
    /**
     * Submit an evidence claim.
     */
    submitClaim(agentId, claimType, data, options = {}) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return err(`Agent not found: ${agentId}`);
        }
        const now = new Date().toISOString();
        const claimId = `claim_${crypto.randomBytes(8).toString('hex')}`;
        const claim = {
            agentId,
            claimId,
            claimType,
            confidence: options.confidence ?? 0.5,
            contestedBy: [],
            createdAt: now,
            data,
            entityId: options.entityId,
            modelTier: options.modelTier ?? 'standard',
            status: 'proposed',
            trustScore: options.trustScore ?? 0.7,
            verifiedBy: [],
        };
        const validation = evidenceClaimSchema.safeParse(claim);
        if (!validation.success) {
            return err(`Invalid claim: ${validation.error.message}`);
        }
        this.claims.set(claimId, claim);
        // Notify listeners
        for (const listener of this.claimSubmittedListeners) {
            listener(claim);
        }
        const typeListeners = this.claimTypeListeners.get(claimType);
        if (typeListeners) {
            for (const listener of typeListeners) {
                listener(claim);
            }
        }
        // Check for conflicts with existing claims
        this.checkForClaimConflicts(claim);
        return ok(claim);
    }
    // ==========================================================================
    // Trust-Aware Claim Queries
    // ==========================================================================
    subscribeToClaimType(claimType, callback) {
        let listeners = this.claimTypeListeners.get(claimType);
        if (!listeners) {
            listeners = new Set();
            this.claimTypeListeners.set(claimType, listeners);
        }
        listeners.add(callback);
        return () => {
            const current = this.claimTypeListeners.get(claimType);
            if (current) {
                current.delete(callback);
                if (current.size === 0) {
                    this.claimTypeListeners.delete(claimType);
                }
            }
        };
    }
    /**
     * Verify a claim.
     */
    verifyClaim(claimId, verifyingAgentId) {
        const claim = this.claims.get(claimId);
        if (!claim) {
            return err(`Claim not found: ${claimId}`);
        }
        if (verifyingAgentId === claim.agentId) {
            return err('Agent cannot verify its own claim');
        }
        const updated = {
            ...claim,
            status: this.determineClaimStatus(claim.verifiedBy.length + 1, claim.contestedBy.length),
            verifiedBy: [...claim.verifiedBy, verifyingAgentId],
        };
        this.claims.set(claimId, updated);
        // Notify listeners
        for (const listener of this.claimVerifiedListeners) {
            listener(updated);
        }
        return ok(updated);
    }
    checkForClaimConflicts(newClaim) {
        if (!newClaim.entityId)
            return;
        const existingClaims = this.getClaimsForEntity(newClaim.entityId);
        for (const existing of existingClaims) {
            if (existing.claimId === newClaim.claimId)
                continue;
            if (existing.claimType === newClaim.claimType && existing.agentId !== newClaim.agentId) {
                // Potential duplicate finding
                this.createConflict('duplicate_finding', [existing.agentId, newClaim.agentId], {
                    reason: `Duplicate ${newClaim.claimType} claim for entity ${newClaim.entityId}`,
                });
            }
        }
    }
    determineClaimStatus(verifyCount, contestCount) {
        if (contestCount >= 2) {
            return 'rejected';
        }
        if (contestCount > 0) {
            return 'contested';
        }
        if (verifyCount >= 2) {
            return 'consensus';
        }
        if (verifyCount > 0) {
            return 'verified';
        }
        return 'proposed';
    }
    /**
     * Load blackboard state.
     */
    async loadSnapshot() {
        try {
            const content = await fs.readFile(this.snapshotPath, 'utf8');
            const result = safeParseJson(blackboardStateSchema, content);
            if (!result.ok) {
                console.warn('[Blackboard] Invalid snapshot, starting fresh:', result.error);
                return;
            }
            const state = result.value;
            // Restore agents
            for (const agent of state.agents) {
                this.agents.set(agent.agentId, agent);
            }
            // Restore claims
            for (const claim of state.claims) {
                this.claims.set(claim.claimId, claim);
            }
            // Restore conflicts
            for (const conflict of state.conflicts) {
                this.conflicts.set(conflict.conflictId, conflict);
            }
            // Restore tasks
            this.taskGraph.importTasks(state.tasks);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return;
            }
            throw error;
        }
    }
}
