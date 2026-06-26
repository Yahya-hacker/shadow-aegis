/**
 * Deterministic Vulnerability Fingerprinting
 *
 * Generates stable `vuln_id` values that are reproducible across reruns
 * for the same finding in the same codebase.
 *
 * ID is derived from:
 *  - Normalized title / type
 *  - Primary file path + symbol name (when available)
 *  - CWE identifier
 *  - Key evidence locations (line numbers, normalized)
 */
export interface FingerprintInput {
    /** CWE identifier, e.g. "CWE-89" */
    cwe: string;
    /** Primary file paths (first is used as primary) */
    filePaths?: string[];
    /** Optional line numbers from primary evidence locations */
    lineNumbers?: number[];
    /** Optional symbol name (function, class, variable) */
    symbolName?: string;
    /** Vulnerability title */
    title: string;
}
/**
 * Generate a deterministic, stable vulnerability ID from the given inputs.
 *
 * The resulting ID has the form:
 *   `SHADOW-<CWE_SHORT>-<HEX8>`
 *
 * where HEX8 is the first 8 hex characters of a SHA-256 digest of the
 * normalised inputs, and CWE_SHORT is derived from the CWE (e.g. "089" for
 * CWE-89).
 *
 * Same inputs → same ID; changing CWE/file/title/lines → different ID.
 */
export declare function computeVulnId(input: FingerprintInput): string;
/**
 * Generate a root-cause fingerprint string used to group duplicate findings.
 *
 * This is intentionally broader than computeVulnId — it ignores specific
 * line numbers and symbol names so that multiple occurrences of the same
 * vulnerability class in the same file cluster under one root cause.
 */
export declare function computeRootCauseFingerprint(input: FingerprintInput): string;
