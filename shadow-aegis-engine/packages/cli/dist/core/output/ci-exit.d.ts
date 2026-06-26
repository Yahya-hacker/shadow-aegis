/**
 * CI Exit Code Helper
 *
 * Determines the process exit code for CI-grade runs based on the severity
 * of findings and a configurable failure threshold.
 *
 * Exit codes:
 *  0  — success (no findings at or above the threshold)
 *  1  — findings found at or above the threshold
 *  2  — internal error / invalid configuration
 */
import type { SecurityFinding } from './report-schema.js';
export type FailOnSeverity = 'critical' | 'high' | 'low' | 'medium' | 'none';
export interface CiExitOptions {
    /** Severity level at which to exit non-zero. Default: "high". */
    failOn?: FailOnSeverity;
    /** Array of findings from the completed audit. */
    findings: SecurityFinding[];
}
export interface CiExitResult {
    /** Exit code to pass to process.exit() */
    code: number;
    /** Human-readable explanation */
    message: string;
    /** Findings that triggered the non-zero exit (may be empty) */
    triggeringFindings: SecurityFinding[];
}
/**
 * Compute the CI exit code and result summary for a completed audit.
 */
export declare function computeCiExitCode(options: CiExitOptions): CiExitResult;
/**
 * Format a human-readable CI summary for console output.
 */
export declare function formatCiSummary(result: CiExitResult, failOn?: FailOnSeverity): string;
