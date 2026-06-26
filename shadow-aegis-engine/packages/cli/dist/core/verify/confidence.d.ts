/**
 * Confidence Calculator - Evidence-based confidence scoring.
 */
import type { LinkingResult } from './evidence-linker.js';
export interface ConfidenceFactors {
    codeEvidencePresent: boolean;
    contradictionsFound: boolean;
    dataFlowVerified: boolean;
    manuallyVerified: boolean;
    multipleToolsConfirm: boolean;
    toolRunCount: number;
    truncationDetected: boolean;
}
export interface ConfidenceResult {
    breakdown: Record<string, number>;
    confidence: number;
    level: 'high' | 'insufficient' | 'low' | 'medium';
    warnings: string[];
}
/**
 * Calculate confidence score from evidence factors.
 */
export declare function calculateConfidence(factors: ConfidenceFactors): ConfidenceResult;
/**
 * Calculate confidence from evidence linking result.
 */
export declare function confidenceFromLinking(linking: LinkingResult, additionalFactors?: Partial<ConfidenceFactors>): ConfidenceResult;
/**
 * Minimum confidence thresholds for different actions.
 */
export declare const CONFIDENCE_THRESHOLDS: {
    /** Minimum confidence for critical findings */
    critical: number;
    /** Minimum confidence for high severity findings */
    highSeverity: number;
    /** Minimum confidence to include in report */
    reportInclusion: number;
    /** Minimum confidence to mark as verified */
    verified: number;
};
/**
 * Check if confidence meets threshold for action.
 */
export declare function meetsThreshold(confidence: number, threshold: keyof typeof CONFIDENCE_THRESHOLDS): boolean;
