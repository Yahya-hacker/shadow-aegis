/**
 * Hive-Mind Schemas - Typed contracts for multi-agent collaboration.
 */
import { z } from 'zod';
import { canonicalIdSchema, confidenceSchema, shortIdSchema, timestampSchema } from '../schema/base.js';
// ============================================================================
// Agent Role Schema
// ============================================================================
export const agentRoleSchema = z.enum([
    'recon', // Reconnaissance and discovery
    'taint-tracer', // Data flow tracing
    'exploit-analyst', // Exploit analysis and verification
    'patch-engineer', // Remediation suggestions
    'verifier', // Finding verification
    'reporter', // Report generation
    'orchestrator', // Coordination (main agent)
]);
/**
 * Agent registration.
 */
export const agentRegistrationSchema = z.object({
    agentId: shortIdSchema,
    capabilities: z.array(z.string()).default([]),
    lastHeartbeat: timestampSchema,
    registeredAt: timestampSchema,
    role: agentRoleSchema,
    status: z.enum(['active', 'idle', 'busy', 'offline']).default('idle'),
});
// ============================================================================
// Task Schema
// ============================================================================
export const taskPrioritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export const taskStatusSchema = z.enum([
    'pending', // Waiting to be claimed
    'claimed', // Claimed by an agent
    'in_progress', // Being worked on
    'completed', // Successfully completed
    'failed', // Failed with error
    'blocked', // Blocked by dependency
    'cancelled', // Cancelled
]);
/**
 * A task in the task queue.
 */
export const taskSchema = z.object({
    assignedAgent: shortIdSchema.optional(),
    claimedAt: timestampSchema.optional(),
    completedAt: timestampSchema.optional(),
    createdAt: timestampSchema,
    dependencies: z.array(shortIdSchema).default([]),
    description: z.string().min(1),
    errorMessage: z.string().optional(),
    parameters: z.record(z.unknown()).default({}),
    priority: taskPrioritySchema,
    requiredRole: agentRoleSchema.optional(),
    result: z.unknown().optional(),
    status: taskStatusSchema,
    taskId: shortIdSchema,
    taskType: z.string().min(1),
    timeout: z.number().int().positive().optional(),
    updatedAt: timestampSchema,
});
// ============================================================================
// Model Tier Schema (for epistemic trust scoring)
// ============================================================================
export const modelTierSchema = z.enum(['premium', 'standard', 'local']);
// ============================================================================
// Evidence Claim Schema
// ============================================================================
export const evidenceClaimStatusSchema = z.enum([
    'proposed', // Proposed but not verified
    'verified', // Verified by another agent
    'contested', // IF it works then itContested by another agent
    'rejected', // Rejected after review
    'consensus', // Consensus reached
]);
/**
 * An evidence claim from an agent.
 *
 * The `trustScore` and `modelTier` fields enable epistemic trust scoring:
 * claims from weaker models carry lower trust and are flagged as unverified
 * hints when consumed by stronger models.
 */
export const evidenceClaimSchema = z.object({
    agentId: shortIdSchema,
    claimId: shortIdSchema,
    claimType: z.string().min(1),
    confidence: confidenceSchema,
    contestedBy: z.array(shortIdSchema).default([]),
    createdAt: timestampSchema,
    data: z.record(z.unknown()),
    entityId: canonicalIdSchema.optional(),
    modelTier: modelTierSchema.default('standard'),
    status: evidenceClaimStatusSchema,
    trustScore: confidenceSchema.default(0.7),
    verifiedBy: z.array(shortIdSchema).default([]),
});
// ============================================================================
// Conflict Marker Schema
// ============================================================================
export const conflictTypeSchema = z.enum([
    'duplicate_finding', // Multiple agents found same issue
    'contradictory_evidence', // Conflicting evidence
    'resource_contention', // Multiple agents targeting same resource
    'confidence_disagreement', // Disagreement on confidence
]);
/**
 * A conflict marker indicating disagreement between agents.
 */
export const conflictMarkerSchema = z.object({
    conflictId: shortIdSchema,
    conflictType: conflictTypeSchema,
    createdAt: timestampSchema,
    description: z.string().min(1),
    involvedAgents: z.array(shortIdSchema),
    relatedClaims: z.array(shortIdSchema).default([]),
    relatedTasks: z.array(shortIdSchema).default([]),
    resolution: z.string().optional(),
    resolvedAt: timestampSchema.optional(),
    status: z.enum(['open', 'resolving', 'resolved', 'escalated']).default('open'),
});
// ============================================================================
// Consensus Schema
// ============================================================================
export const consensusStatusSchema = z.enum([
    'voting', // Votes being collected
    'reached', // Consensus reached
    'failed', // Failed to reach consensus
    'timeout', // Timed out
]);
/**
 * A consensus record for multi-agent decisions.
 */
export const consensusRecordSchema = z.object({
    consensusId: shortIdSchema,
    createdAt: timestampSchema,
    decision: z.string().optional(),
    expiresAt: timestampSchema.optional(),
    proposal: z.string().min(1),
    proposerId: shortIdSchema,
    status: consensusStatusSchema,
    topic: z.string().min(1),
    votes: z.array(z.object({
        agentId: shortIdSchema,
        comment: z.string().optional(),
        timestamp: timestampSchema,
        vote: z.enum(['approve', 'reject', 'abstain']),
    })).default([]),
});
// ============================================================================
// Blackboard State Schema
// ============================================================================
export const blackboardStateSchema = z.object({
    agents: z.array(agentRegistrationSchema).default([]),
    claims: z.array(evidenceClaimSchema).default([]),
    conflicts: z.array(conflictMarkerSchema).default([]),
    consensusRecords: z.array(consensusRecordSchema).default([]),
    runId: shortIdSchema,
    schemaVersion: z.string().default('1.0.0'),
    snapshotAt: timestampSchema,
    tasks: z.array(taskSchema).default([]),
});
