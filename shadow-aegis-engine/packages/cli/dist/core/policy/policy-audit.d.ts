/**
 * Policy Audit - Audit trail for policy decisions.
 */
import { EventEmitter } from 'node:events';
import { z } from 'zod';
import type { CommandPolicyDecision } from './command-policy.js';
import type { MCPActionDecision } from './mcp-policy.js';
export declare const policyDecisionTypeSchema: z.ZodEnum<["command", "mcp", "path", "action"]>;
export type PolicyDecisionType = z.infer<typeof policyDecisionTypeSchema>;
export declare const policyAuditEntrySchema: z.ZodObject<{
    agentId: z.ZodOptional<z.ZodString>;
    allowed: z.ZodBoolean;
    confirmationRequested: z.ZodDefault<z.ZodBoolean>;
    confirmationResult: z.ZodOptional<z.ZodEnum<["approved", "denied", "timeout", "skipped"]>>;
    confirmationTimestamp: z.ZodOptional<z.ZodString>;
    context: z.ZodDefault<z.ZodObject<{
        command: z.ZodOptional<z.ZodString>;
        expertOverride: z.ZodOptional<z.ZodBoolean>;
        operation: z.ZodOptional<z.ZodEnum<["read", "write", "execute"]>>;
        policyConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        requestedPath: z.ZodOptional<z.ZodString>;
        resolvedPath: z.ZodOptional<z.ZodString>;
        serverName: z.ZodOptional<z.ZodString>;
        tier: z.ZodOptional<z.ZodString>;
        toolArgs: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        toolName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        toolName?: string | undefined;
        command?: string | undefined;
        tier?: string | undefined;
        expertOverride?: boolean | undefined;
        operation?: "execute" | "read" | "write" | undefined;
        policyConfig?: Record<string, unknown> | undefined;
        requestedPath?: string | undefined;
        resolvedPath?: string | undefined;
        serverName?: string | undefined;
        toolArgs?: Record<string, unknown> | undefined;
    }, {
        toolName?: string | undefined;
        command?: string | undefined;
        tier?: string | undefined;
        expertOverride?: boolean | undefined;
        operation?: "execute" | "read" | "write" | undefined;
        policyConfig?: Record<string, unknown> | undefined;
        requestedPath?: string | undefined;
        resolvedPath?: string | undefined;
        serverName?: string | undefined;
        toolArgs?: Record<string, unknown> | undefined;
    }>>;
    id: z.ZodString;
    reason: z.ZodString;
    runId: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
    type: z.ZodEnum<["command", "mcp", "path", "action"]>;
    warning: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "mcp" | "path" | "command" | "action";
    schemaVersion: string;
    reason: string;
    timestamp: string;
    runId: string;
    context: {
        toolName?: string | undefined;
        command?: string | undefined;
        tier?: string | undefined;
        expertOverride?: boolean | undefined;
        operation?: "execute" | "read" | "write" | undefined;
        policyConfig?: Record<string, unknown> | undefined;
        requestedPath?: string | undefined;
        resolvedPath?: string | undefined;
        serverName?: string | undefined;
        toolArgs?: Record<string, unknown> | undefined;
    };
    id: string;
    allowed: boolean;
    confirmationRequested: boolean;
    agentId?: string | undefined;
    warning?: string | undefined;
    confirmationResult?: "timeout" | "approved" | "denied" | "skipped" | undefined;
    confirmationTimestamp?: string | undefined;
}, {
    type: "mcp" | "path" | "command" | "action";
    reason: string;
    timestamp: string;
    runId: string;
    id: string;
    allowed: boolean;
    schemaVersion?: string | undefined;
    context?: {
        toolName?: string | undefined;
        command?: string | undefined;
        tier?: string | undefined;
        expertOverride?: boolean | undefined;
        operation?: "execute" | "read" | "write" | undefined;
        policyConfig?: Record<string, unknown> | undefined;
        requestedPath?: string | undefined;
        resolvedPath?: string | undefined;
        serverName?: string | undefined;
        toolArgs?: Record<string, unknown> | undefined;
    } | undefined;
    agentId?: string | undefined;
    warning?: string | undefined;
    confirmationRequested?: boolean | undefined;
    confirmationResult?: "timeout" | "approved" | "denied" | "skipped" | undefined;
    confirmationTimestamp?: string | undefined;
}>;
export type PolicyAuditEntry = z.infer<typeof policyAuditEntrySchema>;
export declare const policyAuditStatsSchema: z.ZodObject<{
    allowed: z.ZodNumber;
    byTier: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    byType: z.ZodRecord<z.ZodString, z.ZodObject<{
        allowed: z.ZodNumber;
        denied: z.ZodNumber;
        total: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        allowed: number;
        denied: number;
        total: number;
    }, {
        allowed: number;
        denied: number;
        total: number;
    }>>;
    confirmations: z.ZodObject<{
        approved: z.ZodNumber;
        denied: z.ZodNumber;
        requested: z.ZodNumber;
        timeout: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        approved: number;
        denied: number;
        requested: number;
    }, {
        timeout: number;
        approved: number;
        denied: number;
        requested: number;
    }>;
    denied: z.ZodNumber;
    expertOverrides: z.ZodNumber;
    totalDecisions: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    allowed: number;
    denied: number;
    byType: Record<string, {
        allowed: number;
        denied: number;
        total: number;
    }>;
    confirmations: {
        timeout: number;
        approved: number;
        denied: number;
        requested: number;
    };
    expertOverrides: number;
    totalDecisions: number;
    byTier?: Record<string, number> | undefined;
}, {
    allowed: number;
    denied: number;
    byType: Record<string, {
        allowed: number;
        denied: number;
        total: number;
    }>;
    confirmations: {
        timeout: number;
        approved: number;
        denied: number;
        requested: number;
    };
    expertOverrides: number;
    totalDecisions: number;
    byTier?: Record<string, number> | undefined;
}>;
export type PolicyAuditStats = z.infer<typeof policyAuditStatsSchema>;
/**
 * Manages policy decision audit trail.
 */
export declare class PolicyAuditManager extends EventEmitter {
    private readonly auditDir;
    private dirty;
    private readonly entries;
    private entryCount;
    private readonly runId;
    constructor(runId: string, auditDir: string);
    /**
     * Generate human-readable audit report.
     */
    generateReport(): string;
    /**
     * Get all entries.
     */
    getAllEntries(): PolicyAuditEntry[];
    /**
     * Get denied entries.
     */
    getDeniedEntries(): PolicyAuditEntry[];
    /**
     * Get entries by type.
     */
    getEntriesByType(type: PolicyDecisionType): PolicyAuditEntry[];
    /**
     * Get entry by ID.
     */
    getEntry(id: string): PolicyAuditEntry | undefined;
    /**
     * Compute audit statistics.
     */
    getStats(): PolicyAuditStats;
    /**
     * Load audit log from disk.
     */
    load(): Promise<void>;
    /**
     * Record a command policy decision.
     */
    recordCommandDecision(command: string, decision: CommandPolicyDecision, expertOverride?: boolean): PolicyAuditEntry;
    /**
     * Update an entry with confirmation result.
     */
    recordConfirmation(entryId: string, result: 'approved' | 'denied' | 'timeout'): void;
    /**
     * Record an MCP action policy decision.
     */
    recordMCPDecision(serverName: string, toolName: string, toolArgs: Record<string, unknown>, decision: MCPActionDecision, expertOverride?: boolean): PolicyAuditEntry;
    /**
     * Record a path policy decision.
     */
    recordPathDecision(requestedPath: string, resolvedPath: null | string, operation: 'execute' | 'read' | 'write', allowed: boolean, reason: string): PolicyAuditEntry;
    /**
     * Save audit log to disk.
     */
    save(): Promise<void>;
    private addEntry;
    private createEntry;
    private sanitizeArgs;
}
/**
 * Initialize global audit manager.
 */
export declare function initializeAuditManager(runId: string, auditDir: string): PolicyAuditManager;
/**
 * Get global audit manager.
 */
export declare function getAuditManager(): null | PolicyAuditManager;
