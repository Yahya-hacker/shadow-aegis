/**
 * Finding Deduplication and Grouping
 *
 * Groups multiple occurrences (locations) of the same root-cause vulnerability
 * under a single canonical finding, merges evidence and locations
 * deterministically, and avoids SARIF rule/result spam.
 */
import type { SecurityFinding } from './report-schema.js';
/**
 * Deduplicate and group an array of security findings.
 *
 * Findings with the same root-cause fingerprint (same CWE + normalised title
 * + primary file) are merged into a single finding whose `file_paths` is the
 * union of all affected files and whose `vuln_id` is recomputed to be stable.
 *
 * The resulting array is sorted by `vuln_id` for deterministic SARIF output.
 */
export declare function deduplicateFindings(findings: SecurityFinding[]): SecurityFinding[];
/**
 * Return the severity level that represents the highest risk among the given
 * findings. Returns `null` when the array is empty.
 */
export declare function highestSeverity(findings: SecurityFinding[]): null | SecurityFinding['severity_label'];
