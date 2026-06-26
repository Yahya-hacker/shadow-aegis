/**
 * License Guard — Feature-gating middleware for Pro features.
 *
 * Checks whether the user's current license tier permits the requested
 * audit mode or CI configuration. Returns a structured result that the
 * UI layer renders as a polished paywall if access is denied.
 *
 * Philosophy: No obfuscation, no DRM. Honest users and enterprises pay
 * for convenience and support, not for cracked binaries.
 */
import { validateLicense } from '../licensing/polar-validator.js';
// =============================================================================
// Constants
// =============================================================================
const UPGRADE_URL = 'https://polar.sh/Yahya-hacker/shadow-auditor';
/** Audit modes that require a Pro license */
const PRO_AUDIT_MODES = new Set(['deep-sast', 'full-report']);
// =============================================================================
// Guard Logic
// =============================================================================
/**
 * Check whether the given configuration requires a Pro license,
 * and if so, whether the user's license key grants access.
 *
 * Free features (always allowed):
 *   - triage, balanced, deep, quick, patch-only modes
 *   - Interactive shell usage
 *   - Basic SAST analysis
 *
 * Pro features (gated):
 *   - deep-sast mode
 *   - full-report mode
 *   - CI mode (ci.enabled)
 */
export async function enforceLicenseGate(config) {
    // Determine which Pro feature (if any) is being requested
    let gatedFeature = null;
    if (config.auditMode && PRO_AUDIT_MODES.has(config.auditMode)) {
        gatedFeature = `"${config.auditMode}" audit mode`;
    }
    else if (config.ci?.enabled) {
        gatedFeature = 'CI/CD integration';
    }
    // No Pro feature requested → always allowed
    if (!gatedFeature) {
        return { allowed: true };
    }
    // Validate the license
    const result = await validateLicense(config.licenseKey);
    // Pro or Solo with Pro features → allowed
    if (result.tier === 'pro') {
        return { allowed: true };
    }
    // Solo tier can access deep-sast but not full-report or CI
    if (result.tier === 'solo' && config.auditMode === 'deep-sast') {
        return { allowed: true };
    }
    // Blocked
    return {
        allowed: false,
        currentTier: result.tier,
        feature: gatedFeature,
        requiredTier: 'pro',
        upgradeUrl: UPGRADE_URL,
    };
}
// =============================================================================
// Exports for testing
// =============================================================================
export { PRO_AUDIT_MODES, UPGRADE_URL };
