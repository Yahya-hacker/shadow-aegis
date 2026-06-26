/**
 * Hive-Mind Schemas - Typed contracts for multi-agent collaboration.
 */
import { z } from 'zod';
export declare const agentRoleSchema: z.ZodEnum<["recon", "taint-tracer", "exploit-analyst", "patch-engineer", "verifier", "reporter", "orchestrator"]>;
export type AgentRole = z.infer<typeof agentRoleSchema>;
/**
 * Agent registration.
 */
export declare const agentRegistrationSchema: z.ZodObject<{
    agentId: z.ZodString;
    capabilities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    lastHeartbeat: z.ZodString;
    registeredAt: z.ZodString;
    role: z.ZodEnum<["recon", "taint-tracer", "exploit-analyst", "patch-engineer", "verifier", "reporter", "orchestrator"]>;
    status: z.ZodDefault<z.ZodEnum<["active", "idle", "busy", "offline"]>>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "idle" | "busy" | "offline";
    agentId: string;
    capabilities: string[];
    lastHeartbeat: string;
    registeredAt: string;
    role: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator";
}, {
    agentId: string;
    lastHeartbeat: string;
    registeredAt: string;
    role: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator";
    status?: "active" | "idle" | "busy" | "offline" | undefined;
    capabilities?: string[] | undefined;
}>;
export type AgentRegistration = z.infer<typeof agentRegistrationSchema>;
export declare const taskPrioritySchema: z.ZodEnum<["critical", "high", "medium", "low"]>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export declare const taskStatusSchema: z.ZodEnum<["pending", "claimed", "in_progress", "completed", "failed", "blocked", "cancelled"]>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
/**
 * A task in the task queue.
 */
export declare const taskSchema: z.ZodObject<{
    assignedAgent: z.ZodOptional<z.ZodString>;
    claimedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
    dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodString;
    errorMessage: z.ZodOptional<z.ZodString>;
    parameters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
    requiredRole: z.ZodOptional<z.ZodEnum<["recon", "taint-tracer", "exploit-analyst", "patch-engineer", "verifier", "reporter", "orchestrator"]>>;
    result: z.ZodOptional<z.ZodUnknown>;
    status: z.ZodEnum<["pending", "claimed", "in_progress", "completed", "failed", "blocked", "cancelled"]>;
    taskId: z.ZodString;
    taskType: z.ZodString;
    timeout: z.ZodOptional<z.ZodNumber>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | "claimed" | "failed";
    description: string;
    createdAt: string;
    updatedAt: string;
    priority: "critical" | "high" | "low" | "medium";
    parameters: Record<string, unknown>;
    dependencies: string[];
    taskId: string;
    taskType: string;
    errorMessage?: string | undefined;
    assignedAgent?: string | undefined;
    claimedAt?: string | undefined;
    completedAt?: string | undefined;
    requiredRole?: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator" | undefined;
    result?: unknown;
    timeout?: number | undefined;
}, {
    status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | "claimed" | "failed";
    description: string;
    createdAt: string;
    updatedAt: string;
    priority: "critical" | "high" | "low" | "medium";
    taskId: string;
    taskType: string;
    parameters?: Record<string, unknown> | undefined;
    errorMessage?: string | undefined;
    assignedAgent?: string | undefined;
    claimedAt?: string | undefined;
    completedAt?: string | undefined;
    dependencies?: string[] | undefined;
    requiredRole?: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator" | undefined;
    result?: unknown;
    timeout?: number | undefined;
}>;
export type Task = z.infer<typeof taskSchema>;
export declare const modelTierSchema: z.ZodEnum<["premium", "standard", "local"]>;
export type ModelTier = z.infer<typeof modelTierSchema>;
export declare const evidenceClaimStatusSchema: z.ZodEnum<["proposed", "verified", "contested", "rejected", "consensus"]>;
export type EvidenceClaimStatus = z.infer<typeof evidenceClaimStatusSchema>;
/**
 * An evidence claim from an agent.
 *
 * The `trustScore` and `modelTier` fields enable epistemic trust scoring:
 * claims from weaker models carry lower trust and are flagged as unverified
 * hints when consumed by stronger models.
 */
export declare const evidenceClaimSchema: z.ZodObject<{
    agentId: z.ZodString;
    claimId: z.ZodString;
    claimType: z.ZodString;
    confidence: z.ZodNumber;
    contestedBy: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    entityId: z.ZodOptional<z.ZodString>;
    modelTier: z.ZodDefault<z.ZodEnum<["premium", "standard", "local"]>>;
    status: z.ZodEnum<["proposed", "verified", "contested", "rejected", "consensus"]>;
    trustScore: z.ZodDefault<z.ZodNumber>;
    verifiedBy: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "proposed" | "verified" | "rejected" | "contested" | "consensus";
    createdAt: string;
    data: Record<string, unknown>;
    confidence: number;
    agentId: string;
    claimId: string;
    claimType: string;
    contestedBy: string[];
    modelTier: "premium" | "standard" | "local";
    trustScore: number;
    verifiedBy: string[];
    entityId?: string | undefined;
}, {
    status: "proposed" | "verified" | "rejected" | "contested" | "consensus";
    createdAt: string;
    data: Record<string, unknown>;
    confidence: number;
    agentId: string;
    claimId: string;
    claimType: string;
    contestedBy?: string[] | undefined;
    entityId?: string | undefined;
    modelTier?: "premium" | "standard" | "local" | undefined;
    trustScore?: number | undefined;
    verifiedBy?: string[] | undefined;
}>;
export type EvidenceClaim = z.infer<typeof evidenceClaimSchema>;
export declare const conflictTypeSchema: z.ZodEnum<["duplicate_finding", "contradictory_evidence", "resource_contention", "confidence_disagreement"]>;
export type ConflictType = z.infer<typeof conflictTypeSchema>;
/**
 * A conflict marker indicating disagreement between agents.
 */
export declare const conflictMarkerSchema: z.ZodObject<{
    conflictId: z.ZodString;
    conflictType: z.ZodEnum<["duplicate_finding", "contradictory_evidence", "resource_contention", "confidence_disagreement"]>;
    createdAt: z.ZodString;
    description: z.ZodString;
    involvedAgents: z.ZodArray<z.ZodString, "many">;
    relatedClaims: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    relatedTasks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    resolution: z.ZodOptional<z.ZodString>;
    resolvedAt: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["open", "resolving", "resolved", "escalated"]>>;
}, "strip", z.ZodTypeAny, {
    status: "open" | "resolving" | "resolved" | "escalated";
    description: string;
    createdAt: string;
    conflictId: string;
    conflictType: "duplicate_finding" | "contradictory_evidence" | "resource_contention" | "confidence_disagreement";
    involvedAgents: string[];
    relatedClaims: string[];
    relatedTasks: string[];
    resolution?: string | undefined;
    resolvedAt?: string | undefined;
}, {
    description: string;
    createdAt: string;
    conflictId: string;
    conflictType: "duplicate_finding" | "contradictory_evidence" | "resource_contention" | "confidence_disagreement";
    involvedAgents: string[];
    status?: "open" | "resolving" | "resolved" | "escalated" | undefined;
    relatedClaims?: string[] | undefined;
    relatedTasks?: string[] | undefined;
    resolution?: string | undefined;
    resolvedAt?: string | undefined;
}>;
export type ConflictMarker = z.infer<typeof conflictMarkerSchema>;
export declare const consensusStatusSchema: z.ZodEnum<["voting", "reached", "failed", "timeout"]>;
export type ConsensusStatus = z.infer<typeof consensusStatusSchema>;
/**
 * A consensus record for multi-agent decisions.
 */
export declare const consensusRecordSchema: z.ZodObject<{
    consensusId: z.ZodString;
    createdAt: z.ZodString;
    decision: z.ZodOptional<z.ZodString>;
    expiresAt: z.ZodOptional<z.ZodString>;
    proposal: z.ZodString;
    proposerId: z.ZodString;
    status: z.ZodEnum<["voting", "reached", "failed", "timeout"]>;
    topic: z.ZodString;
    votes: z.ZodDefault<z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        comment: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
        vote: z.ZodEnum<["approve", "reject", "abstain"]>;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        agentId: string;
        vote: "approve" | "reject" | "abstain";
        comment?: string | undefined;
    }, {
        timestamp: string;
        agentId: string;
        vote: "approve" | "reject" | "abstain";
        comment?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    status: "failed" | "timeout" | "voting" | "reached";
    createdAt: string;
    consensusId: string;
    proposal: string;
    proposerId: string;
    topic: string;
    votes: {
        timestamp: string;
        agentId: string;
        vote: "approve" | "reject" | "abstain";
        comment?: string | undefined;
    }[];
    decision?: string | undefined;
    expiresAt?: string | undefined;
}, {
    status: "failed" | "timeout" | "voting" | "reached";
    createdAt: string;
    consensusId: string;
    proposal: string;
    proposerId: string;
    topic: string;
    decision?: string | undefined;
    expiresAt?: string | undefined;
    votes?: {
        timestamp: string;
        agentId: string;
        vote: "approve" | "reject" | "abstain";
        comment?: string | undefined;
    }[] | undefined;
}>;
export type ConsensusRecord = z.infer<typeof consensusRecordSchema>;
export declare const blackboardStateSchema: z.ZodObject<{
    agents: z.ZodDefault<z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        capabilities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        lastHeartbeat: z.ZodString;
        registeredAt: z.ZodString;
        role: z.ZodEnum<["recon", "taint-tracer", "exploit-analyst", "patch-engineer", "verifier", "reporter", "orchestrator"]>;
        status: z.ZodDefault<z.ZodEnum<["active", "idle", "busy", "offline"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "active" | "idle" | "busy" | "offline";
        agentId: string;
        capabilities: string[];
        lastHeartbeat: string;
        registeredAt: string;
        role: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator";
    }, {
        agentId: string;
        lastHeartbeat: string;
        registeredAt: string;
        role: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator";
        status?: "active" | "idle" | "busy" | "offline" | undefined;
        capabilities?: string[] | undefined;
    }>, "many">>;
    claims: z.ZodDefault<z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        claimId: z.ZodString;
        claimType: z.ZodString;
        confidence: z.ZodNumber;
        contestedBy: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        createdAt: z.ZodString;
        data: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        entityId: z.ZodOptional<z.ZodString>;
        modelTier: z.ZodDefault<z.ZodEnum<["premium", "standard", "local"]>>;
        status: z.ZodEnum<["proposed", "verified", "contested", "rejected", "consensus"]>;
        trustScore: z.ZodDefault<z.ZodNumber>;
        verifiedBy: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "proposed" | "verified" | "rejected" | "contested" | "consensus";
        createdAt: string;
        data: Record<string, unknown>;
        confidence: number;
        agentId: string;
        claimId: string;
        claimType: string;
        contestedBy: string[];
        modelTier: "premium" | "standard" | "local";
        trustScore: number;
        verifiedBy: string[];
        entityId?: string | undefined;
    }, {
        status: "proposed" | "verified" | "rejected" | "contested" | "consensus";
        createdAt: string;
        data: Record<string, unknown>;
        confidence: number;
        agentId: string;
        claimId: string;
        claimType: string;
        contestedBy?: string[] | undefined;
        entityId?: string | undefined;
        modelTier?: "premium" | "standard" | "local" | undefined;
        trustScore?: number | undefined;
        verifiedBy?: string[] | undefined;
    }>, "many">>;
    conflicts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        conflictId: z.ZodString;
        conflictType: z.ZodEnum<["duplicate_finding", "contradictory_evidence", "resource_contention", "confidence_disagreement"]>;
        createdAt: z.ZodString;
        description: z.ZodString;
        involvedAgents: z.ZodArray<z.ZodString, "many">;
        relatedClaims: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        relatedTasks: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        resolution: z.ZodOptional<z.ZodString>;
        resolvedAt: z.ZodOptional<z.ZodString>;
        status: z.ZodDefault<z.ZodEnum<["open", "resolving", "resolved", "escalated"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "open" | "resolving" | "resolved" | "escalated";
        description: string;
        createdAt: string;
        conflictId: string;
        conflictType: "duplicate_finding" | "contradictory_evidence" | "resource_contention" | "confidence_disagreement";
        involvedAgents: string[];
        relatedClaims: string[];
        relatedTasks: string[];
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
    }, {
        description: string;
        createdAt: string;
        conflictId: string;
        conflictType: "duplicate_finding" | "contradictory_evidence" | "resource_contention" | "confidence_disagreement";
        involvedAgents: string[];
        status?: "open" | "resolving" | "resolved" | "escalated" | undefined;
        relatedClaims?: string[] | undefined;
        relatedTasks?: string[] | undefined;
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
    }>, "many">>;
    consensusRecords: z.ZodDefault<z.ZodArray<z.ZodObject<{
        consensusId: z.ZodString;
        createdAt: z.ZodString;
        decision: z.ZodOptional<z.ZodString>;
        expiresAt: z.ZodOptional<z.ZodString>;
        proposal: z.ZodString;
        proposerId: z.ZodString;
        status: z.ZodEnum<["voting", "reached", "failed", "timeout"]>;
        topic: z.ZodString;
        votes: z.ZodDefault<z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            comment: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
            vote: z.ZodEnum<["approve", "reject", "abstain"]>;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            agentId: string;
            vote: "approve" | "reject" | "abstain";
            comment?: string | undefined;
        }, {
            timestamp: string;
            agentId: string;
            vote: "approve" | "reject" | "abstain";
            comment?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        status: "failed" | "timeout" | "voting" | "reached";
        createdAt: string;
        consensusId: string;
        proposal: string;
        proposerId: string;
        topic: string;
        votes: {
            timestamp: string;
            agentId: string;
            vote: "approve" | "reject" | "abstain";
            comment?: string | undefined;
        }[];
        decision?: string | undefined;
        expiresAt?: string | undefined;
    }, {
        status: "failed" | "timeout" | "voting" | "reached";
        createdAt: string;
        consensusId: string;
        proposal: string;
        proposerId: string;
        topic: string;
        decision?: string | undefined;
        expiresAt?: string | undefined;
        votes?: {
            timestamp: string;
            agentId: string;
            vote: "approve" | "reject" | "abstain";
            comment?: string | undefined;
        }[] | undefined;
    }>, "many">>;
    runId: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
    snapshotAt: z.ZodString;
    tasks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        assignedAgent: z.ZodOptional<z.ZodString>;
        claimedAt: z.ZodOptional<z.ZodString>;
        completedAt: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodString;
        dependencies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        description: z.ZodString;
        errorMessage: z.ZodOptional<z.ZodString>;
        parameters: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
        requiredRole: z.ZodOptional<z.ZodEnum<["recon", "taint-tracer", "exploit-analyst", "patch-engineer", "verifier", "reporter", "orchestrator"]>>;
        result: z.ZodOptional<z.ZodUnknown>;
        status: z.ZodEnum<["pending", "claimed", "in_progress", "completed", "failed", "blocked", "cancelled"]>;
        taskId: z.ZodString;
        taskType: z.ZodString;
        timeout: z.ZodOptional<z.ZodNumber>;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | "claimed" | "failed";
        description: string;
        createdAt: string;
        updatedAt: string;
        priority: "critical" | "high" | "low" | "medium";
        parameters: Record<string, unknown>;
        dependencies: string[];
        taskId: string;
        taskType: string;
        errorMessage?: string | undefined;
        assignedAgent?: string | undefined;
        claimedAt?: string | undefined;
        completedAt?: string | undefined;
        requiredRole?: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator" | undefined;
        result?: unknown;
        timeout?: number | undefined;
    }, {
        status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | "claimed" | "failed";
        description: string;
        createdAt: string;
        updatedAt: string;
        priority: "critical" | "high" | "low" | "medium";
        taskId: string;
        taskType: string;
        parameters?: Record<string, unknown> | undefined;
        errorMessage?: string | undefined;
        assignedAgent?: string | undefined;
        claimedAt?: string | undefined;
        completedAt?: string | undefined;
        dependencies?: string[] | undefined;
        requiredRole?: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator" | undefined;
        result?: unknown;
        timeout?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    runId: string;
    snapshotAt: string;
    agents: {
        status: "active" | "idle" | "busy" | "offline";
        agentId: string;
        capabilities: string[];
        lastHeartbeat: string;
        registeredAt: string;
        role: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator";
    }[];
    claims: {
        status: "proposed" | "verified" | "rejected" | "contested" | "consensus";
        createdAt: string;
        data: Record<string, unknown>;
        confidence: number;
        agentId: string;
        claimId: string;
        claimType: string;
        contestedBy: string[];
        modelTier: "premium" | "standard" | "local";
        trustScore: number;
        verifiedBy: string[];
        entityId?: string | undefined;
    }[];
    conflicts: {
        status: "open" | "resolving" | "resolved" | "escalated";
        description: string;
        createdAt: string;
        conflictId: string;
        conflictType: "duplicate_finding" | "contradictory_evidence" | "resource_contention" | "confidence_disagreement";
        involvedAgents: string[];
        relatedClaims: string[];
        relatedTasks: string[];
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
    }[];
    consensusRecords: {
        status: "failed" | "timeout" | "voting" | "reached";
        createdAt: string;
        consensusId: string;
        proposal: string;
        proposerId: string;
        topic: string;
        votes: {
            timestamp: string;
            agentId: string;
            vote: "approve" | "reject" | "abstain";
            comment?: string | undefined;
        }[];
        decision?: string | undefined;
        expiresAt?: string | undefined;
    }[];
    tasks: {
        status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | "claimed" | "failed";
        description: string;
        createdAt: string;
        updatedAt: string;
        priority: "critical" | "high" | "low" | "medium";
        parameters: Record<string, unknown>;
        dependencies: string[];
        taskId: string;
        taskType: string;
        errorMessage?: string | undefined;
        assignedAgent?: string | undefined;
        claimedAt?: string | undefined;
        completedAt?: string | undefined;
        requiredRole?: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator" | undefined;
        result?: unknown;
        timeout?: number | undefined;
    }[];
}, {
    runId: string;
    snapshotAt: string;
    schemaVersion?: string | undefined;
    agents?: {
        agentId: string;
        lastHeartbeat: string;
        registeredAt: string;
        role: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator";
        status?: "active" | "idle" | "busy" | "offline" | undefined;
        capabilities?: string[] | undefined;
    }[] | undefined;
    claims?: {
        status: "proposed" | "verified" | "rejected" | "contested" | "consensus";
        createdAt: string;
        data: Record<string, unknown>;
        confidence: number;
        agentId: string;
        claimId: string;
        claimType: string;
        contestedBy?: string[] | undefined;
        entityId?: string | undefined;
        modelTier?: "premium" | "standard" | "local" | undefined;
        trustScore?: number | undefined;
        verifiedBy?: string[] | undefined;
    }[] | undefined;
    conflicts?: {
        description: string;
        createdAt: string;
        conflictId: string;
        conflictType: "duplicate_finding" | "contradictory_evidence" | "resource_contention" | "confidence_disagreement";
        involvedAgents: string[];
        status?: "open" | "resolving" | "resolved" | "escalated" | undefined;
        relatedClaims?: string[] | undefined;
        relatedTasks?: string[] | undefined;
        resolution?: string | undefined;
        resolvedAt?: string | undefined;
    }[] | undefined;
    consensusRecords?: {
        status: "failed" | "timeout" | "voting" | "reached";
        createdAt: string;
        consensusId: string;
        proposal: string;
        proposerId: string;
        topic: string;
        decision?: string | undefined;
        expiresAt?: string | undefined;
        votes?: {
            timestamp: string;
            agentId: string;
            vote: "approve" | "reject" | "abstain";
            comment?: string | undefined;
        }[] | undefined;
    }[] | undefined;
    tasks?: {
        status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | "claimed" | "failed";
        description: string;
        createdAt: string;
        updatedAt: string;
        priority: "critical" | "high" | "low" | "medium";
        taskId: string;
        taskType: string;
        parameters?: Record<string, unknown> | undefined;
        errorMessage?: string | undefined;
        assignedAgent?: string | undefined;
        claimedAt?: string | undefined;
        completedAt?: string | undefined;
        dependencies?: string[] | undefined;
        requiredRole?: "recon" | "taint-tracer" | "exploit-analyst" | "patch-engineer" | "verifier" | "reporter" | "orchestrator" | undefined;
        result?: unknown;
        timeout?: number | undefined;
    }[] | undefined;
}>;
export type BlackboardState = z.infer<typeof blackboardStateSchema>;
