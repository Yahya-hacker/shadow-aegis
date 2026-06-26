/**
 * MCP Action Policy - Policy tiers for MCP tool invocations.
 */
import { z } from 'zod';
export declare const mcpActionTierSchema: z.ZodEnum<["safe", "sensitive", "dangerous", "blocked"]>;
export type MCPActionTier = z.infer<typeof mcpActionTierSchema>;
export declare const mcpActionPolicySchema: z.ZodObject<{
    /** Whether to allow dangerous actions at all */
    allowDangerousActions: z.ZodDefault<z.ZodBoolean>;
    /** Whether to log all MCP actions */
    auditAllActions: z.ZodDefault<z.ZodBoolean>;
    /** Expert override flag */
    expertUnsafe: z.ZodDefault<z.ZodBoolean>;
    /** Whether to require confirmation for dangerous actions */
    requireDangerousConfirmation: z.ZodDefault<z.ZodBoolean>;
    /** Whether to require confirmation for sensitive actions */
    requireSensitiveConfirmation: z.ZodDefault<z.ZodBoolean>;
    schemaVersion: z.ZodDefault<z.ZodString>;
    /** Server-specific tier defaults */
    serverTiers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodEnum<["safe", "sensitive", "dangerous", "blocked"]>>>;
    /** Tool-specific tier overrides */
    toolTiers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodEnum<["safe", "sensitive", "dangerous", "blocked"]>>>;
}, "strip", z.ZodTypeAny, {
    expertUnsafe: boolean;
    schemaVersion: string;
    allowDangerousActions: boolean;
    auditAllActions: boolean;
    requireDangerousConfirmation: boolean;
    requireSensitiveConfirmation: boolean;
    serverTiers: Record<string, "blocked" | "safe" | "sensitive" | "dangerous">;
    toolTiers: Record<string, "blocked" | "safe" | "sensitive" | "dangerous">;
}, {
    expertUnsafe?: boolean | undefined;
    schemaVersion?: string | undefined;
    allowDangerousActions?: boolean | undefined;
    auditAllActions?: boolean | undefined;
    requireDangerousConfirmation?: boolean | undefined;
    requireSensitiveConfirmation?: boolean | undefined;
    serverTiers?: Record<string, "blocked" | "safe" | "sensitive" | "dangerous"> | undefined;
    toolTiers?: Record<string, "blocked" | "safe" | "sensitive" | "dangerous"> | undefined;
}>;
export type MCPActionPolicy = z.infer<typeof mcpActionPolicySchema>;
export declare const mcpActionDecisionSchema: z.ZodObject<{
    allowed: z.ZodBoolean;
    reason: z.ZodString;
    requiresConfirmation: z.ZodBoolean;
    tier: z.ZodEnum<["safe", "sensitive", "dangerous", "blocked"]>;
    warning: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    tier: "blocked" | "safe" | "sensitive" | "dangerous";
    allowed: boolean;
    requiresConfirmation: boolean;
    warning?: string | undefined;
}, {
    reason: string;
    tier: "blocked" | "safe" | "sensitive" | "dangerous";
    allowed: boolean;
    requiresConfirmation: boolean;
    warning?: string | undefined;
}>;
export type MCPActionDecision = z.infer<typeof mcpActionDecisionSchema>;
/**
 * Evaluates MCP action policy for a specific tool invocation.
 */
export declare function evaluateMCPPolicy(serverName: string, toolName: string, policy?: Partial<MCPActionPolicy>): MCPActionDecision;
/**
 * Check if a tool should be auto-approved based on tier.
 */
export declare function isAutoApproved(decision: MCPActionDecision): boolean;
/**
 * Get a summary of policy for display.
 */
export declare function getPolicySummary(policy?: Partial<MCPActionPolicy>): string;
/**
 * Builder for creating MCP policies.
 */
export declare class MCPPolicyBuilder {
    private policy;
    constructor(base?: Partial<MCPActionPolicy>);
    allowDangerous(value: boolean): this;
    blockServer(serverName: string): this;
    blockTool(serverName: string, toolName: string): this;
    build(): MCPActionPolicy;
    setExpertUnsafe(value: boolean): this;
    setServerTier(serverName: string, tier: MCPActionTier): this;
    setToolTier(serverName: string, toolName: string, tier: MCPActionTier): this;
}
