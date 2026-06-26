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
import type { ShadowConfig } from '../../utils/config.js';
import { type LicenseTier } from '../licensing/polar-validator.js';
export interface LicenseGateResult {
    /** Whether the feature is allowed */
    allowed: boolean;
    /** The user's current tier */
    currentTier?: LicenseTier;
    /** Human-readable feature name that triggered the gate */
    feature?: string;
    /** The tier required to use this feature */
    requiredTier?: LicenseTier;
    /** Upgrade URL */
    upgradeUrl?: string;
}
declare const UPGRADE_URL = "https://polar.sh/Yahya-hacker/shadow-auditor";
/** Audit modes that require a Pro license */
declare const PRO_AUDIT_MODES: Set<string>;
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
export declare function enforceLicenseGate(config: ShadowConfig): Promise<LicenseGateResult>;
export { PRO_AUDIT_MODES, UPGRADE_URL };
