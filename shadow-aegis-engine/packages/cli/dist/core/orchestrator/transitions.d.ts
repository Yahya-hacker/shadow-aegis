/**
 * Mission Transitions - State transition logic and validation.
 */
import { type Result } from '../schema/base.js';
import { type BudgetState, type Hypothesis, type MissionPhase, type MissionState, type PendingAction, type TransitionReason } from './mission-state.js';
export interface TransitionContext {
    completedActionId?: string;
    error?: Error;
    evidenceCollected?: boolean;
    hypothesesUpdated?: Hypothesis[];
    newActions?: PendingAction[];
    tokensUsed?: number;
    verificationPassed?: boolean;
}
export interface TransitionResult {
    events: Array<{
        payload: Record<string, unknown>;
        type: string;
    }>;
    newState: MissionState;
}
/**
 * Attempt a state transition with validation.
 */
export declare function attemptTransition(currentState: MissionState, targetPhase: MissionPhase, reason: TransitionReason, context?: TransitionContext): Result<TransitionResult, string>;
/**
 * Get allowed transitions for current state considering budget and other constraints.
 */
export declare function getAllowedTransitionsForState(state: MissionState): MissionPhase[];
/**
 * Check if budget is exhausted.
 */
export declare function isBudgetExhausted(budget: BudgetState): boolean;
/**
 * Check if state has verified findings ready for reporting.
 */
export declare function hasVerifiedFindings(state: MissionState): boolean;
/**
 * Determine recommended next phase based on current state.
 */
export declare function recommendNextPhase(state: MissionState): null | {
    phase: MissionPhase;
    reason: TransitionReason;
};
/**
 * Calculate overall mission confidence from hypotheses.
 */
export declare function calculateMissionConfidence(state: MissionState): number;
