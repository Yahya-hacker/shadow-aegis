/**
 * Mission State - OODA-inspired state machine for security analysis.
 *
 * States:
 * - OBSERVE: Collect evidence and events from tools
 * - ORIENT: Build hypotheses and rank context
 * - DECIDE: Choose next actions via planner and policy
 * - ACT: Execute tools safely through policy gates
 * - VERIFY: Anti-hallucination gates and confidence updates
 * - REPORT: Generate validated output
 */
import { z } from 'zod';
import { confidenceSchema, shortIdSchema, timestampSchema } from '../schema/base.js';
// ============================================================================
// Mission State Schema
// ============================================================================
export const missionPhaseSchema = z.enum([
    'OBSERVE',
    'ORIENT',
    'DECIDE',
    'ACT',
    'VERIFY',
    'REPORT',
    'COMPLETE',
    'FAILED',
]);
/**
 * Reason for state transition.
 */
export const transitionReasonSchema = z.enum([
    'evidence_collected',
    'hypotheses_formed',
    'action_selected',
    'action_executed',
    'verification_passed',
    'verification_failed',
    'report_generated',
    'error_occurred',
    'user_interrupt',
    'budget_exhausted',
    'confidence_threshold_reached',
]);
/**
 * Mission objective - what the analysis is trying to achieve.
 */
export const missionObjectiveSchema = z.object({
    constraints: z.array(z.string()).default([]),
    description: z.string().min(1),
    objectiveId: shortIdSchema,
    priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
    scope: z.object({
        excludePaths: z.array(z.string()).default([]),
        includePaths: z.array(z.string()).default([]),
        targetTypes: z.array(z.string()).default([]),
    }),
    status: z.enum(['pending', 'in_progress', 'completed', 'blocked', 'cancelled']).default('pending'),
});
/**
 * Budget tracking for the mission.
 */
export const budgetStateSchema = z.object({
    maxTokens: z.number().int().positive(),
    maxToolCalls: z.number().int().positive(),
    tokensUsed: z.number().int().nonnegative().default(0),
    toolCallsUsed: z.number().int().nonnegative().default(0),
});
/**
 * Hypothesis about a potential vulnerability or issue.
 */
export const hypothesisSchema = z.object({
    confidence: confidenceSchema,
    createdAt: timestampSchema,
    description: z.string().min(1),
    evidenceIds: z.array(shortIdSchema).default([]),
    hypothesisId: shortIdSchema,
    status: z.enum(['proposed', 'investigating', 'verified', 'rejected']).default('proposed'),
    type: z.string().min(1),
    updatedAt: timestampSchema,
});
/**
 * Pending action to be executed.
 */
export const pendingActionSchema = z.object({
    actionId: shortIdSchema,
    estimatedTokens: z.number().int().nonnegative().optional(),
    hypothesisId: shortIdSchema.optional(),
    parameters: z.record(z.unknown()),
    priority: z.number().default(0),
    rationale: z.string().min(1),
    toolName: z.string().min(1),
});
/**
 * Complete mission state snapshot.
 */
export const missionStateSchema = z.object({
    budget: budgetStateSchema,
    completedActions: z.array(shortIdSchema).default([]),
    confidence: confidenceSchema.default(0),
    currentPhase: missionPhaseSchema,
    errorMessage: z.string().optional(),
    hypotheses: z.array(hypothesisSchema).default([]),
    lastTransitionAt: timestampSchema,
    lastTransitionReason: transitionReasonSchema.optional(),
    missionId: shortIdSchema,
    objectives: z.array(missionObjectiveSchema).default([]),
    pendingActions: z.array(pendingActionSchema).default([]),
    phaseHistory: z.array(z.object({
        phase: missionPhaseSchema,
        reason: transitionReasonSchema,
        timestamp: timestampSchema,
    })).default([]),
    startedAt: timestampSchema,
});
// ============================================================================
// State Transition Rules
// ============================================================================
/**
 * Valid transitions from each phase.
 */
export const VALID_TRANSITIONS = {
    ACT: ['VERIFY', 'OBSERVE', 'FAILED'],
    COMPLETE: [], // Terminal state
    DECIDE: ['ACT', 'REPORT', 'OBSERVE', 'FAILED'],
    FAILED: [], // Terminal state
    OBSERVE: ['ORIENT', 'FAILED'],
    ORIENT: ['DECIDE', 'OBSERVE', 'FAILED'],
    REPORT: ['COMPLETE', 'OBSERVE', 'FAILED'],
    VERIFY: ['ORIENT', 'REPORT', 'ACT', 'FAILED'],
};
/**
 * Check if a transition is valid.
 */
export function isValidTransition(from, to) {
    return VALID_TRANSITIONS[from].includes(to);
}
/**
 * Get allowed next phases from current phase.
 */
export function getAllowedTransitions(phase) {
    return VALID_TRANSITIONS[phase];
}
// ============================================================================
// Phase Descriptions
// ============================================================================
export const PHASE_DESCRIPTIONS = {
    ACT: 'Executing tools safely through policy gates',
    COMPLETE: 'Mission completed successfully',
    DECIDE: 'Choosing next actions via planner and policy',
    FAILED: 'Mission failed due to error or constraint violation',
    OBSERVE: 'Collecting evidence and events from tools',
    ORIENT: 'Building hypotheses and ranking context',
    REPORT: 'Generating validated output',
    VERIFY: 'Running anti-hallucination gates and updating confidence',
};
/**
 * Check if a phase is terminal.
 */
export function isTerminalPhase(phase) {
    return phase === 'COMPLETE' || phase === 'FAILED';
}
/**
 * Check if a phase allows tool execution.
 */
export function phaseAllowsToolExecution(phase) {
    return phase === 'OBSERVE' || phase === 'ACT';
}
