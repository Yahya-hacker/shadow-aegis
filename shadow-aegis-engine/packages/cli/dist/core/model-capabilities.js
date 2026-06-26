import { EventEmitter } from 'node:events';
import { z } from 'zod';
import { SCHEMA_VERSION } from './schema/base.js';
// =============================================================================
// Budget Tracking Schemas
// =============================================================================
export const budgetStatusSchema = z.object({
    continuationRequired: z.boolean(),
    exhaustionReason: z.string().optional(),
    // Status
    isExhausted: z.boolean(),
    lastUpdatedAt: z.string().datetime(),
    outputTokensBudget: z.number().int().positive(),
    // Percentages
    outputTokensPercent: z.number().min(0).max(100),
    outputTokensRemaining: z.number().int(),
    // Token budgets
    outputTokensUsed: z.number().int().nonnegative(),
    runId: z.string(),
    schemaVersion: z.string().default(SCHEMA_VERSION),
    // Timestamps
    startedAt: z.string().datetime(),
    toolStepsBudget: z.number().int().positive(),
    toolStepsPercent: z.number().min(0).max(100),
    toolStepsRemaining: z.number().int(),
    // Step budgets
    toolStepsUsed: z.number().int().nonnegative(),
});
export const continuationStrategySchema = z.enum([
    'checkpoint_and_resume', // Save checkpoint, expect manual resume
    'auto_continue', // Automatically continue in new context
    'graceful_stop', // Finish current task, don't start new ones
    'hard_stop', // Stop immediately, save state
]);
const FALLBACK_CAPABILITIES = {
    maxOutputTokens: 16_000,
    maxToolSteps: 10,
    preferredAuditMode: 'balanced',
    supportsLongOutput: false,
    supportsReasoningMode: false,
};
const CAPABILITY_RULES = [
    // Anthropic (2026-generation models)
    {
        capabilities: {
            maxOutputTokens: 64_000,
            maxToolSteps: 22,
            preferredAuditMode: 'deep',
            supportsLongOutput: true,
            supportsReasoningMode: true,
        },
        modelPattern: /claude-(opus|sonnet|haiku)-4\.5/i,
        provider: 'anthropic',
    },
    {
        capabilities: {
            maxOutputTokens: 64_000,
            maxToolSteps: 20,
            preferredAuditMode: 'deep',
            supportsLongOutput: true,
            supportsReasoningMode: true,
        },
        modelPattern: /.*/,
        provider: 'anthropic',
    },
    // OpenAI / Codex family (2026 constraints requested by user)
    {
        capabilities: {
            maxOutputTokens: 48_000,
            maxToolSteps: 20,
            preferredAuditMode: 'deep',
            supportsLongOutput: true,
            supportsReasoningMode: true,
        },
        modelPattern: /gpt-5\.3-codex/i,
        provider: 'openai',
    },
    {
        capabilities: {
            maxOutputTokens: 40_000,
            maxToolSteps: 18,
            preferredAuditMode: 'balanced',
            supportsLongOutput: true,
            supportsReasoningMode: true,
        },
        modelPattern: /gpt-5\.(2|1)(-codex)?/i,
        provider: 'openai',
    },
    {
        capabilities: {
            maxOutputTokens: 32_000,
            maxToolSteps: 16,
            preferredAuditMode: 'balanced',
            supportsLongOutput: true,
            supportsReasoningMode: true,
        },
        modelPattern: /gpt-5(\.4)?-mini/i,
        provider: 'openai',
    },
    {
        capabilities: {
            maxOutputTokens: 16_000,
            maxToolSteps: 12,
            preferredAuditMode: 'balanced',
            supportsLongOutput: false,
            supportsReasoningMode: false,
        },
        modelPattern: /.*/,
        provider: 'openai',
    },
    // Other providers (safe but practical defaults)
    {
        capabilities: {
            maxOutputTokens: 16_000,
            maxToolSteps: 12,
            preferredAuditMode: 'balanced',
            supportsLongOutput: false,
            supportsReasoningMode: false,
        },
        modelPattern: /.*/,
        provider: 'google',
    },
    {
        capabilities: {
            maxOutputTokens: 16_000,
            maxToolSteps: 12,
            preferredAuditMode: 'balanced',
            supportsLongOutput: false,
            supportsReasoningMode: true,
        },
        modelPattern: /.*/,
        provider: 'mistral',
    },
    {
        capabilities: {
            maxOutputTokens: 8000,
            maxToolSteps: 10,
            preferredAuditMode: 'quick',
            supportsLongOutput: false,
            supportsReasoningMode: false,
        },
        modelPattern: /.*/,
        provider: 'ollama',
    },
    {
        capabilities: {
            maxOutputTokens: 16_000,
            maxToolSteps: 10,
            preferredAuditMode: 'balanced',
            supportsLongOutput: false,
            supportsReasoningMode: false,
        },
        modelPattern: /.*/,
        provider: 'custom',
    },
];
function toPositiveInteger(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return null;
    }
    const normalized = Math.floor(value);
    if (normalized <= 0) {
        return null;
    }
    return normalized;
}
export function resolveModelCapabilities(config) {
    const provider = config.provider.trim().toLowerCase();
    const model = config.model.trim();
    const matchedRule = CAPABILITY_RULES.find((rule) => rule.provider === provider && rule.modelPattern.test(model));
    if (!matchedRule) {
        return FALLBACK_CAPABILITIES;
    }
    return matchedRule.capabilities;
}
export function effectiveMaxOutputTokens(config, onWarning) {
    const modelCapabilities = resolveModelCapabilities(config);
    const requested = toPositiveInteger(config.maxOutputTokens);
    if (requested === null) {
        return modelCapabilities.maxOutputTokens;
    }
    if (requested > modelCapabilities.maxOutputTokens) {
        onWarning?.(`Requested max output tokens exceeds model limit; clamped to ${modelCapabilities.maxOutputTokens}.`);
        return modelCapabilities.maxOutputTokens;
    }
    return requested;
}
export function effectiveMaxToolSteps(config) {
    const modelCapabilities = resolveModelCapabilities(config);
    const requested = toPositiveInteger(config.maxToolSteps);
    if (requested === null) {
        return modelCapabilities.maxToolSteps;
    }
    return Math.min(requested, modelCapabilities.maxToolSteps);
}
/**
 * Returns token and step budget multipliers for a given audit mode.
 *
 * - triage / quick: minimal retrieval, fastest scan
 * - balanced:       pragmatic depth
 * - deep / deep-sast: full analysis
 * - full-report:    deep-sast + report enrichment (slightly more tokens)
 * - patch-only:     only patches/fixes, no lengthy narrative
 */
export function auditModeBudgetMultiplier(mode) {
    switch (mode) {
        case 'balanced': {
            return { steps: 0.8, tokens: 0.7 };
        }
        case 'deep':
        case 'deep-sast': {
            return { steps: 1, tokens: 1 };
        }
        case 'full-report': {
            return { steps: 1, tokens: 1.2 };
        }
        case 'patch-only': {
            return { steps: 0.6, tokens: 0.5 };
        }
        case 'quick':
        case 'triage': {
            return { steps: 0.5, tokens: 0.4 };
        }
        default: {
            return { steps: 1, tokens: 1 };
        }
    }
}
export function resolveRuntimeSettings(config, onWarning, auditMode) {
    const capabilities = resolveModelCapabilities(config);
    const baseTokens = effectiveMaxOutputTokens(config, onWarning);
    const baseSteps = effectiveMaxToolSteps(config);
    if (!auditMode) {
        // No explicit mode: use raw model defaults (backward-compatible behaviour)
        return {
            capabilities,
            maxOutputTokens: baseTokens,
            maxToolSteps: baseSteps,
        };
    }
    const multiplier = auditModeBudgetMultiplier(auditMode);
    return {
        capabilities,
        maxOutputTokens: Math.max(1, Math.round(baseTokens * multiplier.tokens)),
        maxToolSteps: Math.max(1, Math.round(baseSteps * multiplier.steps)),
    };
}
/**
 * Tracks and manages model budget (tokens and steps).
 */
// eslint-disable-next-line unicorn/prefer-event-target
export class BudgetManager extends EventEmitter {
    continuationStrategy;
    criticalEmitted = false;
    criticalThreshold;
    lastUpdatedAt;
    outputTokensBudget;
    outputTokensUsed = 0;
    runId;
    startedAt;
    toolStepsBudget;
    toolStepsUsed = 0;
    warningEmitted = false;
    warningThreshold;
    constructor(options) {
        super();
        this.runId = options.runId;
        this.outputTokensBudget = options.outputTokensBudget;
        this.toolStepsBudget = options.toolStepsBudget;
        this.continuationStrategy = options.continuationStrategy ?? 'graceful_stop';
        this.warningThreshold = options.warningThreshold ?? 80;
        this.criticalThreshold = options.criticalThreshold ?? 95;
        this.startedAt = new Date();
        this.lastUpdatedAt = new Date();
    }
    /**
     * Estimate if there's enough budget for an operation.
     */
    canAfford(estimatedTokens, estimatedSteps = 1) {
        const status = this.getStatus();
        return (status.outputTokensRemaining >= estimatedTokens &&
            status.toolStepsRemaining >= estimatedSteps);
    }
    /**
     * Get the continuation strategy.
     */
    getContinuationStrategy() {
        return this.continuationStrategy;
    }
    /**
     * Get current budget status.
     */
    getStatus() {
        const outputTokensRemaining = this.outputTokensBudget - this.outputTokensUsed;
        const toolStepsRemaining = this.toolStepsBudget - this.toolStepsUsed;
        const outputTokensPercent = Math.min(100, (this.outputTokensUsed / this.outputTokensBudget) * 100);
        const toolStepsPercent = Math.min(100, (this.toolStepsUsed / this.toolStepsBudget) * 100);
        const isExhausted = outputTokensRemaining <= 0 || toolStepsRemaining <= 0;
        let exhaustionReason;
        if (outputTokensRemaining <= 0) {
            exhaustionReason = 'Output token budget exhausted';
        }
        else if (toolStepsRemaining <= 0) {
            exhaustionReason = 'Tool step budget exhausted';
        }
        const continuationRequired = isExhausted ||
            outputTokensPercent >= this.criticalThreshold ||
            toolStepsPercent >= this.criticalThreshold;
        return {
            continuationRequired,
            exhaustionReason,
            isExhausted,
            lastUpdatedAt: this.lastUpdatedAt.toISOString(),
            outputTokensBudget: this.outputTokensBudget,
            outputTokensPercent: Math.round(outputTokensPercent * 10) / 10,
            outputTokensRemaining,
            outputTokensUsed: this.outputTokensUsed,
            runId: this.runId,
            schemaVersion: SCHEMA_VERSION,
            startedAt: this.startedAt.toISOString(),
            toolStepsBudget: this.toolStepsBudget,
            toolStepsPercent: Math.round(toolStepsPercent * 10) / 10,
            toolStepsRemaining,
            toolStepsUsed: this.toolStepsUsed,
        };
    }
    /**
     * Get a summary string for logging.
     */
    getSummary() {
        const status = this.getStatus();
        return [
            `Budget: ${status.outputTokensUsed}/${status.outputTokensBudget} tokens (${status.outputTokensPercent.toFixed(1)}%)`,
            `${status.toolStepsUsed}/${status.toolStepsBudget} steps (${status.toolStepsPercent.toFixed(1)}%)`,
            status.continuationRequired ? `[CONTINUATION REQUIRED: ${this.continuationStrategy}]` : '',
        ].filter(Boolean).join(', ');
    }
    /**
     * Check if there's budget for more work.
     */
    hasBudget() {
        return !this.getStatus().isExhausted;
    }
    /**
     * Check if continuation is required.
     */
    needsContinuation() {
        return this.getStatus().continuationRequired;
    }
    /**
     * Record a tool step.
     */
    recordStep() {
        this.toolStepsUsed++;
        this.lastUpdatedAt = new Date();
        this.checkThresholds();
    }
    /**
     * Record token usage.
     */
    recordTokens(count) {
        this.outputTokensUsed += count;
        this.lastUpdatedAt = new Date();
        this.checkThresholds();
    }
    checkThresholds() {
        const status = this.getStatus();
        const maxPercent = Math.max(status.outputTokensPercent, status.toolStepsPercent);
        // Check warning threshold
        if (!this.warningEmitted && maxPercent >= this.warningThreshold) {
            this.warningEmitted = true;
            this.emit('warning', status);
        }
        // Check critical threshold
        if (!this.criticalEmitted && maxPercent >= this.criticalThreshold) {
            this.criticalEmitted = true;
            this.emit('critical', status);
        }
        // Check exhaustion
        if (status.isExhausted) {
            this.emit('exhausted', status);
        }
    }
}
// =============================================================================
// Factory Function
// =============================================================================
/**
 * Create a budget manager from runtime settings.
 */
export function createBudgetManager(runId, settings, continuationStrategy) {
    return new BudgetManager({
        continuationStrategy: continuationStrategy ?? settings.capabilities.continuationStrategy ?? 'graceful_stop',
        outputTokensBudget: settings.maxOutputTokens,
        runId,
        toolStepsBudget: settings.maxToolSteps,
    });
}
