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
export declare const missionPhaseSchema: z.ZodEnum<["OBSERVE", "ORIENT", "DECIDE", "ACT", "VERIFY", "REPORT", "COMPLETE", "FAILED"]>;
export type MissionPhase = z.infer<typeof missionPhaseSchema>;
/**
 * Reason for state transition.
 */
export declare const transitionReasonSchema: z.ZodEnum<["evidence_collected", "hypotheses_formed", "action_selected", "action_executed", "verification_passed", "verification_failed", "report_generated", "error_occurred", "user_interrupt", "budget_exhausted", "confidence_threshold_reached"]>;
export type TransitionReason = z.infer<typeof transitionReasonSchema>;
/**
 * Mission objective - what the analysis is trying to achieve.
 */
export declare const missionObjectiveSchema: z.ZodObject<{
    constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodString;
    objectiveId: z.ZodString;
    priority: z.ZodDefault<z.ZodEnum<["critical", "high", "medium", "low"]>>;
    scope: z.ZodObject<{
        excludePaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        includePaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        targetTypes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        excludePaths: string[];
        includePaths: string[];
        targetTypes: string[];
    }, {
        excludePaths?: string[] | undefined;
        includePaths?: string[] | undefined;
        targetTypes?: string[] | undefined;
    }>;
    status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed", "blocked", "cancelled"]>>;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
    description: string;
    constraints: string[];
    objectiveId: string;
    priority: "critical" | "high" | "low" | "medium";
    scope: {
        excludePaths: string[];
        includePaths: string[];
        targetTypes: string[];
    };
}, {
    description: string;
    objectiveId: string;
    scope: {
        excludePaths?: string[] | undefined;
        includePaths?: string[] | undefined;
        targetTypes?: string[] | undefined;
    };
    status?: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | undefined;
    constraints?: string[] | undefined;
    priority?: "critical" | "high" | "low" | "medium" | undefined;
}>;
export type MissionObjective = z.infer<typeof missionObjectiveSchema>;
/**
 * Budget tracking for the mission.
 */
export declare const budgetStateSchema: z.ZodObject<{
    maxTokens: z.ZodNumber;
    maxToolCalls: z.ZodNumber;
    tokensUsed: z.ZodDefault<z.ZodNumber>;
    toolCallsUsed: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxTokens: number;
    maxToolCalls: number;
    tokensUsed: number;
    toolCallsUsed: number;
}, {
    maxTokens: number;
    maxToolCalls: number;
    tokensUsed?: number | undefined;
    toolCallsUsed?: number | undefined;
}>;
export type BudgetState = z.infer<typeof budgetStateSchema>;
/**
 * Hypothesis about a potential vulnerability or issue.
 */
export declare const hypothesisSchema: z.ZodObject<{
    confidence: z.ZodNumber;
    createdAt: z.ZodString;
    description: z.ZodString;
    evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    hypothesisId: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["proposed", "investigating", "verified", "rejected"]>>;
    type: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: string;
    status: "proposed" | "investigating" | "verified" | "rejected";
    description: string;
    createdAt: string;
    updatedAt: string;
    confidence: number;
    evidenceIds: string[];
    hypothesisId: string;
}, {
    type: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    confidence: number;
    hypothesisId: string;
    status?: "proposed" | "investigating" | "verified" | "rejected" | undefined;
    evidenceIds?: string[] | undefined;
}>;
export type Hypothesis = z.infer<typeof hypothesisSchema>;
/**
 * Pending action to be executed.
 */
export declare const pendingActionSchema: z.ZodObject<{
    actionId: z.ZodString;
    estimatedTokens: z.ZodOptional<z.ZodNumber>;
    hypothesisId: z.ZodOptional<z.ZodString>;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    priority: z.ZodDefault<z.ZodNumber>;
    rationale: z.ZodString;
    toolName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    toolName: string;
    priority: number;
    actionId: string;
    parameters: Record<string, unknown>;
    rationale: string;
    hypothesisId?: string | undefined;
    estimatedTokens?: number | undefined;
}, {
    toolName: string;
    actionId: string;
    parameters: Record<string, unknown>;
    rationale: string;
    priority?: number | undefined;
    hypothesisId?: string | undefined;
    estimatedTokens?: number | undefined;
}>;
export type PendingAction = z.infer<typeof pendingActionSchema>;
/**
 * Complete mission state snapshot.
 */
export declare const missionStateSchema: z.ZodObject<{
    budget: z.ZodObject<{
        maxTokens: z.ZodNumber;
        maxToolCalls: z.ZodNumber;
        tokensUsed: z.ZodDefault<z.ZodNumber>;
        toolCallsUsed: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxTokens: number;
        maxToolCalls: number;
        tokensUsed: number;
        toolCallsUsed: number;
    }, {
        maxTokens: number;
        maxToolCalls: number;
        tokensUsed?: number | undefined;
        toolCallsUsed?: number | undefined;
    }>;
    completedActions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    confidence: z.ZodDefault<z.ZodNumber>;
    currentPhase: z.ZodEnum<["OBSERVE", "ORIENT", "DECIDE", "ACT", "VERIFY", "REPORT", "COMPLETE", "FAILED"]>;
    errorMessage: z.ZodOptional<z.ZodString>;
    hypotheses: z.ZodDefault<z.ZodArray<z.ZodObject<{
        confidence: z.ZodNumber;
        createdAt: z.ZodString;
        description: z.ZodString;
        evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        hypothesisId: z.ZodString;
        status: z.ZodDefault<z.ZodEnum<["proposed", "investigating", "verified", "rejected"]>>;
        type: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        status: "proposed" | "investigating" | "verified" | "rejected";
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        evidenceIds: string[];
        hypothesisId: string;
    }, {
        type: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        hypothesisId: string;
        status?: "proposed" | "investigating" | "verified" | "rejected" | undefined;
        evidenceIds?: string[] | undefined;
    }>, "many">>;
    lastTransitionAt: z.ZodString;
    lastTransitionReason: z.ZodOptional<z.ZodEnum<["evidence_collected", "hypotheses_formed", "action_selected", "action_executed", "verification_passed", "verification_failed", "report_generated", "error_occurred", "user_interrupt", "budget_exhausted", "confidence_threshold_reached"]>>;
    missionId: z.ZodString;
    objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        constraints: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        description: z.ZodString;
        objectiveId: z.ZodString;
        priority: z.ZodDefault<z.ZodEnum<["critical", "high", "medium", "low"]>>;
        scope: z.ZodObject<{
            excludePaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            includePaths: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
            targetTypes: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            excludePaths: string[];
            includePaths: string[];
            targetTypes: string[];
        }, {
            excludePaths?: string[] | undefined;
            includePaths?: string[] | undefined;
            targetTypes?: string[] | undefined;
        }>;
        status: z.ZodDefault<z.ZodEnum<["pending", "in_progress", "completed", "blocked", "cancelled"]>>;
    }, "strip", z.ZodTypeAny, {
        status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
        description: string;
        constraints: string[];
        objectiveId: string;
        priority: "critical" | "high" | "low" | "medium";
        scope: {
            excludePaths: string[];
            includePaths: string[];
            targetTypes: string[];
        };
    }, {
        description: string;
        objectiveId: string;
        scope: {
            excludePaths?: string[] | undefined;
            includePaths?: string[] | undefined;
            targetTypes?: string[] | undefined;
        };
        status?: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | undefined;
        constraints?: string[] | undefined;
        priority?: "critical" | "high" | "low" | "medium" | undefined;
    }>, "many">>;
    pendingActions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        actionId: z.ZodString;
        estimatedTokens: z.ZodOptional<z.ZodNumber>;
        hypothesisId: z.ZodOptional<z.ZodString>;
        parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        priority: z.ZodDefault<z.ZodNumber>;
        rationale: z.ZodString;
        toolName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        toolName: string;
        priority: number;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        hypothesisId?: string | undefined;
        estimatedTokens?: number | undefined;
    }, {
        toolName: string;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        priority?: number | undefined;
        hypothesisId?: string | undefined;
        estimatedTokens?: number | undefined;
    }>, "many">>;
    phaseHistory: z.ZodDefault<z.ZodArray<z.ZodObject<{
        phase: z.ZodEnum<["OBSERVE", "ORIENT", "DECIDE", "ACT", "VERIFY", "REPORT", "COMPLETE", "FAILED"]>;
        reason: z.ZodEnum<["evidence_collected", "hypotheses_formed", "action_selected", "action_executed", "verification_passed", "verification_failed", "report_generated", "error_occurred", "user_interrupt", "budget_exhausted", "confidence_threshold_reached"]>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phase: "OBSERVE" | "ORIENT" | "DECIDE" | "ACT" | "VERIFY" | "REPORT" | "COMPLETE" | "FAILED";
        reason: "evidence_collected" | "hypotheses_formed" | "action_selected" | "action_executed" | "verification_passed" | "verification_failed" | "report_generated" | "error_occurred" | "user_interrupt" | "budget_exhausted" | "confidence_threshold_reached";
        timestamp: string;
    }, {
        phase: "OBSERVE" | "ORIENT" | "DECIDE" | "ACT" | "VERIFY" | "REPORT" | "COMPLETE" | "FAILED";
        reason: "evidence_collected" | "hypotheses_formed" | "action_selected" | "action_executed" | "verification_passed" | "verification_failed" | "report_generated" | "error_occurred" | "user_interrupt" | "budget_exhausted" | "confidence_threshold_reached";
        timestamp: string;
    }>, "many">>;
    startedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confidence: number;
    budget: {
        maxTokens: number;
        maxToolCalls: number;
        tokensUsed: number;
        toolCallsUsed: number;
    };
    completedActions: string[];
    currentPhase: "OBSERVE" | "ORIENT" | "DECIDE" | "ACT" | "VERIFY" | "REPORT" | "COMPLETE" | "FAILED";
    hypotheses: {
        type: string;
        status: "proposed" | "investigating" | "verified" | "rejected";
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        evidenceIds: string[];
        hypothesisId: string;
    }[];
    lastTransitionAt: string;
    missionId: string;
    objectives: {
        status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
        description: string;
        constraints: string[];
        objectiveId: string;
        priority: "critical" | "high" | "low" | "medium";
        scope: {
            excludePaths: string[];
            includePaths: string[];
            targetTypes: string[];
        };
    }[];
    pendingActions: {
        toolName: string;
        priority: number;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        hypothesisId?: string | undefined;
        estimatedTokens?: number | undefined;
    }[];
    phaseHistory: {
        phase: "OBSERVE" | "ORIENT" | "DECIDE" | "ACT" | "VERIFY" | "REPORT" | "COMPLETE" | "FAILED";
        reason: "evidence_collected" | "hypotheses_formed" | "action_selected" | "action_executed" | "verification_passed" | "verification_failed" | "report_generated" | "error_occurred" | "user_interrupt" | "budget_exhausted" | "confidence_threshold_reached";
        timestamp: string;
    }[];
    startedAt: string;
    errorMessage?: string | undefined;
    lastTransitionReason?: "evidence_collected" | "hypotheses_formed" | "action_selected" | "action_executed" | "verification_passed" | "verification_failed" | "report_generated" | "error_occurred" | "user_interrupt" | "budget_exhausted" | "confidence_threshold_reached" | undefined;
}, {
    budget: {
        maxTokens: number;
        maxToolCalls: number;
        tokensUsed?: number | undefined;
        toolCallsUsed?: number | undefined;
    };
    currentPhase: "OBSERVE" | "ORIENT" | "DECIDE" | "ACT" | "VERIFY" | "REPORT" | "COMPLETE" | "FAILED";
    lastTransitionAt: string;
    missionId: string;
    startedAt: string;
    confidence?: number | undefined;
    completedActions?: string[] | undefined;
    errorMessage?: string | undefined;
    hypotheses?: {
        type: string;
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        hypothesisId: string;
        status?: "proposed" | "investigating" | "verified" | "rejected" | undefined;
        evidenceIds?: string[] | undefined;
    }[] | undefined;
    lastTransitionReason?: "evidence_collected" | "hypotheses_formed" | "action_selected" | "action_executed" | "verification_passed" | "verification_failed" | "report_generated" | "error_occurred" | "user_interrupt" | "budget_exhausted" | "confidence_threshold_reached" | undefined;
    objectives?: {
        description: string;
        objectiveId: string;
        scope: {
            excludePaths?: string[] | undefined;
            includePaths?: string[] | undefined;
            targetTypes?: string[] | undefined;
        };
        status?: "pending" | "in_progress" | "completed" | "blocked" | "cancelled" | undefined;
        constraints?: string[] | undefined;
        priority?: "critical" | "high" | "low" | "medium" | undefined;
    }[] | undefined;
    pendingActions?: {
        toolName: string;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        priority?: number | undefined;
        hypothesisId?: string | undefined;
        estimatedTokens?: number | undefined;
    }[] | undefined;
    phaseHistory?: {
        phase: "OBSERVE" | "ORIENT" | "DECIDE" | "ACT" | "VERIFY" | "REPORT" | "COMPLETE" | "FAILED";
        reason: "evidence_collected" | "hypotheses_formed" | "action_selected" | "action_executed" | "verification_passed" | "verification_failed" | "report_generated" | "error_occurred" | "user_interrupt" | "budget_exhausted" | "confidence_threshold_reached";
        timestamp: string;
    }[] | undefined;
}>;
export type MissionState = z.infer<typeof missionStateSchema>;
/**
 * Valid transitions from each phase.
 */
export declare const VALID_TRANSITIONS: Record<MissionPhase, MissionPhase[]>;
/**
 * Check if a transition is valid.
 */
export declare function isValidTransition(from: MissionPhase, to: MissionPhase): boolean;
/**
 * Get allowed next phases from current phase.
 */
export declare function getAllowedTransitions(phase: MissionPhase): MissionPhase[];
export declare const PHASE_DESCRIPTIONS: Record<MissionPhase, string>;
/**
 * Check if a phase is terminal.
 */
export declare function isTerminalPhase(phase: MissionPhase): boolean;
/**
 * Check if a phase allows tool execution.
 */
export declare function phaseAllowsToolExecution(phase: MissionPhase): boolean;
