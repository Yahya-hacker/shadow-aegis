import { EventEmitter } from 'node:events';
import { z } from 'zod';
import type { ShadowConfig } from '../utils/config.js';
export type AuditMode = 'balanced' | 'deep' | 'deep-sast' | 'full-report' | 'patch-only' | 'quick' | 'triage';
export declare const budgetStatusSchema: z.ZodObject<{
    continuationRequired: z.ZodBoolean;
    exhaustionReason: z.ZodOptional<z.ZodString>;
    isExhausted: z.ZodBoolean;
    lastUpdatedAt: z.ZodString;
    outputTokensBudget: z.ZodNumber;
    outputTokensPercent: z.ZodNumber;
    outputTokensRemaining: z.ZodNumber;
    outputTokensUsed: z.ZodNumber;
    runId: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
    startedAt: z.ZodString;
    toolStepsBudget: z.ZodNumber;
    toolStepsPercent: z.ZodNumber;
    toolStepsRemaining: z.ZodNumber;
    toolStepsUsed: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    startedAt: string;
    runId: string;
    continuationRequired: boolean;
    isExhausted: boolean;
    lastUpdatedAt: string;
    outputTokensBudget: number;
    outputTokensPercent: number;
    outputTokensRemaining: number;
    outputTokensUsed: number;
    toolStepsBudget: number;
    toolStepsPercent: number;
    toolStepsRemaining: number;
    toolStepsUsed: number;
    exhaustionReason?: string | undefined;
}, {
    startedAt: string;
    runId: string;
    continuationRequired: boolean;
    isExhausted: boolean;
    lastUpdatedAt: string;
    outputTokensBudget: number;
    outputTokensPercent: number;
    outputTokensRemaining: number;
    outputTokensUsed: number;
    toolStepsBudget: number;
    toolStepsPercent: number;
    toolStepsRemaining: number;
    toolStepsUsed: number;
    schemaVersion?: string | undefined;
    exhaustionReason?: string | undefined;
}>;
export type BudgetStatus = z.infer<typeof budgetStatusSchema>;
export declare const continuationStrategySchema: z.ZodEnum<["checkpoint_and_resume", "auto_continue", "graceful_stop", "hard_stop"]>;
export type ContinuationStrategy = z.infer<typeof continuationStrategySchema>;
export interface ModelCapabilities {
    /** Continuation strategy when budget is exhausted */
    continuationStrategy?: ContinuationStrategy;
    maxOutputTokens: number;
    maxToolSteps: number;
    preferredAuditMode: AuditMode;
    /** Whether model supports context caching */
    supportsContextCaching?: boolean;
    supportsLongOutput: boolean;
    supportsReasoningMode?: boolean;
}
export interface RuntimeSettings {
    capabilities: ModelCapabilities;
    maxOutputTokens: number;
    maxToolSteps: number;
}
export declare function resolveModelCapabilities(config: Pick<ShadowConfig, 'model' | 'provider'>): ModelCapabilities;
export declare function effectiveMaxOutputTokens(config: Pick<ShadowConfig, 'maxOutputTokens' | 'model' | 'provider'>, onWarning?: (message: string) => void): number;
export declare function effectiveMaxToolSteps(config: Pick<ShadowConfig, 'maxToolSteps' | 'model' | 'provider'>): number;
/**
 * Returns token and step budget multipliers for a given audit mode.
 *
 * - triage / quick: minimal retrieval, fastest scan
 * - balanced:       pragmatic depth
 * - deep / deep-sast: full analysis
 * - full-report:    deep-sast + report enrichment (slightly more tokens)
 * - patch-only:     only patches/fixes, no lengthy narrative
 */
export declare function auditModeBudgetMultiplier(mode: AuditMode): {
    steps: number;
    tokens: number;
};
export declare function resolveRuntimeSettings(config: Pick<ShadowConfig, 'maxOutputTokens' | 'maxToolSteps' | 'model' | 'provider'>, onWarning?: (message: string) => void, auditMode?: AuditMode): RuntimeSettings;
export interface BudgetManagerOptions {
    continuationStrategy?: ContinuationStrategy;
    criticalThreshold?: number;
    outputTokensBudget: number;
    runId: string;
    toolStepsBudget: number;
    warningThreshold?: number;
}
/**
 * Tracks and manages model budget (tokens and steps).
 */
export declare class BudgetManager extends EventEmitter {
    private readonly continuationStrategy;
    private criticalEmitted;
    private readonly criticalThreshold;
    private lastUpdatedAt;
    private readonly outputTokensBudget;
    private outputTokensUsed;
    private readonly runId;
    private startedAt;
    private readonly toolStepsBudget;
    private toolStepsUsed;
    private warningEmitted;
    private readonly warningThreshold;
    constructor(options: BudgetManagerOptions);
    /**
     * Estimate if there's enough budget for an operation.
     */
    canAfford(estimatedTokens: number, estimatedSteps?: number): boolean;
    /**
     * Get the continuation strategy.
     */
    getContinuationStrategy(): ContinuationStrategy;
    /**
     * Get current budget status.
     */
    getStatus(): BudgetStatus;
    /**
     * Get a summary string for logging.
     */
    getSummary(): string;
    /**
     * Check if there's budget for more work.
     */
    hasBudget(): boolean;
    /**
     * Check if continuation is required.
     */
    needsContinuation(): boolean;
    /**
     * Record a tool step.
     */
    recordStep(): void;
    /**
     * Record token usage.
     */
    recordTokens(count: number): void;
    private checkThresholds;
}
/**
 * Create a budget manager from runtime settings.
 */
export declare function createBudgetManager(runId: string, settings: RuntimeSettings, continuationStrategy?: ContinuationStrategy): BudgetManager;
