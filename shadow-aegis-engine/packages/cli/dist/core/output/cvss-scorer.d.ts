/**
 * CVSS v3.1 Scorer Helper
 *
 * Validates CVSS v3.1 vector strings and computes base scores from them.
 * Provides consistency checks to warn or auto-correct mismatched score/vector
 * pairs.
 */
type MetricKey = 'A' | 'AC' | 'AV' | 'C' | 'I' | 'PR' | 'S' | 'UI';
export interface CvssParseResult {
    error?: string;
    metrics?: Partial<Record<MetricKey, string>>;
    valid: boolean;
    vector: string;
}
export interface CvssScoreResult {
    /** Computed base score (0.0–10.0, 1 decimal) */
    baseScore: number;
    /** Qualitative severity label */
    severityLabel: 'Critical' | 'High' | 'Info' | 'Low' | 'Medium';
}
export interface CvssConsistencyResult {
    /** Auto-corrected score (if inconsistency found) */
    correctedScore?: number;
    isConsistent: boolean;
    /** Human-readable explanation */
    message: string;
    /** Delta between reported and computed score */
    scoreDelta?: number;
}
/**
 * Parse a CVSS v3.1 vector string into its component metrics.
 *
 * Returns `{ valid: false, error }` if the vector is malformed.
 */
export declare function parseCvssVector(vector: string): CvssParseResult;
/**
 * Compute the CVSS v3.1 base score from parsed metrics.
 *
 * Implements the formula from CVSS v3.1 specification:
 * https://www.first.org/cvss/specification-document
 */
export declare function computeCvssBaseScore(metrics: Partial<Record<MetricKey, string>>): number;
/**
 * Convert a CVSS v3.1 base score to a qualitative severity label.
 */
export declare function cvssScoreToSeverityLabel(score: number): 'Critical' | 'High' | 'Info' | 'Low' | 'Medium';
/**
 * Validate a CVSS v3.1 vector and compute its base score.
 *
 * Returns `null` if the vector is invalid.
 */
export declare function scoreCvssVector(vector: string): CvssScoreResult | null;
/**
 * Check whether a reported CVSS score is consistent with the vector.
 *
 * Tolerance of ±0.5 is allowed to account for rounding differences between
 * implementations. Outside that range, an auto-corrected score is returned.
 */
export declare function checkCvssConsistency(reportedScore: number, vector: string, tolerance?: number): CvssConsistencyResult;
export {};
