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
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
// =============================================================================
// Constants
// =============================================================================
/** Replace with your actual Polar.sh Organization ID */
const POLAR_ORG_ID = 'POLAR_ORG_ID_PLACEHOLDER';
const POLAR_VALIDATE_URL = 'https://api.polar.sh/v1/customer-portal/license-keys/validate';
const CACHE_FILENAME = '.shadow-auditor-license.json';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_GRACE_MS = 72 * 60 * 60 * 1000; // 72 hours grace on network failure
const REQUEST_TIMEOUT_MS = 10_000; // 10 second timeout
// =============================================================================
// Cache Helpers
// =============================================================================
function getCachePath() {
    return path.join(os.homedir(), CACHE_FILENAME);
}
function hashKey(key) {
    return crypto.createHash('sha256').update(key).digest('hex');
}
async function readCache() {
    try {
        const raw = await fs.readFile(getCachePath(), 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.keyHash && parsed.tier && parsed.validatedAt && parsed.expiresAt) {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
}
async function writeCache(entry) {
    try {
        await fs.writeFile(getCachePath(), JSON.stringify(entry, null, 2), 'utf-8');
    }
    catch {
        // Non-fatal: cache write failure doesn't block the user
    }
}
/**
 * Call the Polar.sh Customer Portal validation endpoint.
 * Returns the parsed response or null on network failure.
 */
async function callPolarApi(key) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => { controller.abort(); }, REQUEST_TIMEOUT_MS);
        const response = await fetch(POLAR_VALIDATE_URL, {
            body: JSON.stringify({
                key,
                organization_id: POLAR_ORG_ID,
            }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok)
            return null;
        return (await response.json());
    }
    catch {
        // Network error, timeout, DNS failure, etc.
        return null;
    }
}
/**
 * Extract the license tier from the Polar API response.
 *
 * Tier detection heuristic:
 *   - Benefit description or properties containing "pro" → 'pro'
 *   - Valid key but no "pro" indicator → 'solo'
 *   - Invalid key → 'free'
 */
function extractTier(response) {
    if (!response.valid)
        return 'free';
    const description = response.benefit?.description?.toLowerCase() ?? '';
    const properties = JSON.stringify(response.benefit?.properties ?? {}).toLowerCase();
    if (description.includes('pro') || properties.includes('pro')) {
        return 'pro';
    }
    return 'solo';
}
// =============================================================================
// Public API
// =============================================================================
/**
 * Validate a Polar.sh license key with 24-hour local caching.
 *
 * @param licenseKey - The user's license key. If empty/undefined, returns 'free'.
 * @returns The validation result including tier, cache status, and any errors.
 */
export async function validateLicense(licenseKey) {
    // No key → free tier, no API call
    if (!licenseKey?.trim()) {
        return {
            cached: false,
            tier: 'free',
            validatedAt: new Date().toISOString(),
        };
    }
    const key = licenseKey.trim();
    const currentKeyHash = hashKey(key);
    const now = Date.now();
    // 1. Check local cache
    const cache = await readCache();
    if (cache && cache.keyHash === currentKeyHash) {
        const expiresAt = new Date(cache.expiresAt).getTime();
        // Cache is still valid (within 24h)
        if (now < expiresAt) {
            return {
                cached: true,
                tier: cache.tier,
                validatedAt: cache.validatedAt,
            };
        }
    }
    // 2. Call Polar API
    const response = await callPolarApi(key);
    if (response) {
        const tier = extractTier(response);
        const validatedAt = new Date().toISOString();
        // Write fresh cache
        await writeCache({
            expiresAt: new Date(now + CACHE_TTL_MS).toISOString(),
            keyHash: currentKeyHash,
            tier,
            validatedAt,
        });
        return { cached: false, tier, validatedAt };
    }
    // 3. Network failure — try grace period on expired cache
    if (cache && cache.keyHash === currentKeyHash) {
        const validatedAtMs = new Date(cache.validatedAt).getTime();
        if (now - validatedAtMs < CACHE_GRACE_MS) {
            return {
                cached: true,
                error: 'Network unavailable; using cached validation (grace period)',
                tier: cache.tier,
                validatedAt: cache.validatedAt,
            };
        }
    }
    // 4. No cache, no network → free
    return {
        cached: false,
        error: 'Unable to validate license key (network unavailable)',
        tier: 'free',
        validatedAt: new Date().toISOString(),
    };
}
// =============================================================================
// Exports for testing
// =============================================================================
export { CACHE_FILENAME, CACHE_GRACE_MS, CACHE_TTL_MS, extractTier, getCachePath, hashKey, POLAR_ORG_ID, readCache, writeCache, };
