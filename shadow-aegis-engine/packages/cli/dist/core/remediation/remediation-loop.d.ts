/**
 * Remediation Loop - Automated patch → test → verify → revert cycle.
 *
 * Orchestrates the full remediation workflow:
 * 1. Create a git stash restore point
 * 2. Apply the patch via `git apply`
 * 3. Run tests inside a twin container
 * 4. If fingerprint degraded → auto-revert
 * 5. If no degradation → keep patch
 *
 * The patch-engineer agent NEVER touches the host filesystem directly
 * for test execution — everything runs inside disposable Docker containers.
 */
import { type TestResult, type TestRunner } from './test-runner.js';
export interface RemediationResult {
    appliedPatch: string;
    baselineComparison?: {
        newFailures: string[];
        resolvedFailures: string[];
    };
    findingId: string;
    reverted: boolean;
    status: 'applied' | 'reverted' | 'skipped';
    testResult?: TestResult;
}
export interface RemediationLoopOptions {
    autoRevert?: boolean;
    projectRoot: string;
    testRunner: TestRunner;
}
export declare class RemediationLoop {
    private readonly autoRevert;
    private readonly projectRoot;
    private readonly testRunner;
    constructor(options: RemediationLoopOptions);
    /**
     * Apply a patch using `git apply`.
     * Performs a dry-run first to validate the patch.
     */
    applyPatch(diff: string): Promise<void>;
    /**
     * Create a git stash restore point.
     * Returns the stash reference (e.g., "stash@{0}").
     */
    createRestorePoint(findingId: string): Promise<string>;
    /**
     * Execute the full remediation cycle for a finding.
     */
    execute(findingId: string, patchDiff: string): Promise<RemediationResult>;
    /**
     * Revert to a restore point by popping the stash.
     */
    revertToRestorePoint(stashRef: string): Promise<void>;
    /**
     * Run tests via the TestRunner (twin-container execution).
     */
    runTests(): Promise<TestResult>;
    private shellEscape;
}
