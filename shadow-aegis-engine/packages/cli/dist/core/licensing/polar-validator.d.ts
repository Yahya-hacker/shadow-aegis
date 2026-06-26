/**
 * Polar.sh License Validator — Stateless validation with 24-hour local cache.
 *
 * Validates a user-provided license key against the Polar.sh Customer Portal API.
 * Implements a local cache to avoid rate-limiting: only re-verifies every 24 hours.
 *
 * Failure Modes:
 *   - Network unreachable + valid cache (even expired ≤72h) → honor cache
 *   - Network unreachable + no cache → return 'free'
 *   - Invalid key → return 'free'
 *   - No key provided → return 'free' (skip API call entirely)
 */
export type LicenseTier = 'free' | 'pro' | 'solo';
export interface LicenseValidationResult {
    /** Whether the validation came from the local cache */
    cached: boolean;
    /** Error message if validation failed */
    error?: string;
    /** The resolved license tier */
    tier: LicenseTier;
    /** When this validation was performed */
    validatedAt: string;
}
interface LicenseCacheEntry {
    expiresAt: string;
    keyHash: string;
    tier: LicenseTier;
    validatedAt: string;
}
/** Replace with your actual Polar.sh Organization ID */
declare const POLAR_ORG_ID = "POLAR_ORG_ID_PLACEHOLDER";
declare const CACHE_FILENAME = ".shadow-auditor-license.json";
declare const CACHE_TTL_MS: number;
declare const CACHE_GRACE_MS: number;
declare function getCachePath(): string;
declare function hashKey(key: string): string;
declare function readCache(): Promise<LicenseCacheEntry | null>;
declare function writeCache(entry: LicenseCacheEntry): Promise<void>;
interface PolarValidateResponse {
    benefit?: {
        description?: string;
        properties?: Record<string, unknown>;
    };
    status?: string;
    valid?: boolean;
}
/**
 * Extract the license tier from the Polar API response.
 *
 * Tier detection heuristic:
 *   - Benefit description or properties containing "pro" → 'pro'
 *   - Valid key but no "pro" indicator → 'solo'
 *   - Invalid key → 'free'
 */
declare function extractTier(response: PolarValidateResponse): LicenseTier;
/**
 * Validate a Polar.sh license key with 24-hour local caching.
 *
 * @param licenseKey - The user's license key. If empty/undefined, returns 'free'.
 * @returns The validation result including tier, cache status, and any errors.
 */
export declare function validateLicense(licenseKey?: string): Promise<LicenseValidationResult>;
export { CACHE_FILENAME, CACHE_GRACE_MS, CACHE_TTL_MS, extractTier, getCachePath, hashKey, POLAR_ORG_ID, type PolarValidateResponse, readCache, writeCache, };
