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
import { exec } from 'node:child_process';
// =============================================================================
// Git Helpers
// =============================================================================
function gitExec(command, cwd) {
    return new Promise((resolve) => {
        exec(command, { cwd, maxBuffer: 5 * 1024 * 1024, timeout: 30_000 }, (error, stdout, stderr) => {
            resolve({
                exitCode: error?.code ?? (error ? 1 : 0),
                stderr: typeof stderr === 'string' ? stderr : '',
                stdout: typeof stdout === 'string' ? stdout : '',
            });
        });
    });
}
// =============================================================================
// Remediation Loop
// =============================================================================
export class RemediationLoop {
    autoRevert;
    projectRoot;
    testRunner;
    constructor(options) {
        this.projectRoot = options.projectRoot;
        this.testRunner = options.testRunner;
        this.autoRevert = options.autoRevert ?? true;
    }
    /**
     * Apply a patch using `git apply`.
     * Performs a dry-run first to validate the patch.
     */
    async applyPatch(diff) {
        // Dry run
        const dryRun = await gitExec(`echo ${this.shellEscape(diff)} | git apply --check -`, this.projectRoot);
        if (dryRun.exitCode !== 0) {
            throw new Error(`Patch dry-run failed: ${dryRun.stderr}`);
        }
        // Apply for real
        const apply = await gitExec(`echo ${this.shellEscape(diff)} | git apply -`, this.projectRoot);
        if (apply.exitCode !== 0) {
            throw new Error(`git apply failed: ${apply.stderr}`);
        }
    }
    /**
     * Create a git stash restore point.
     * Returns the stash reference (e.g., "stash@{0}").
     */
    async createRestorePoint(findingId) {
        const stashMessage = `shadow-auditor-pre-patch-${findingId}`;
        // Check for changes first
        const status = await gitExec('git status --porcelain', this.projectRoot);
        if (status.stdout.trim() === '') {
            // Nothing to stash — working tree is clean
            return '';
        }
        const result = await gitExec(`git stash push -m "${stashMessage}"`, this.projectRoot);
        if (result.exitCode !== 0) {
            throw new Error(`git stash failed: ${result.stderr}`);
        }
        return 'stash@{0}';
    }
    /**
     * Execute the full remediation cycle for a finding.
     */
    async execute(findingId, patchDiff) {
        // 1. Create restore point
        let stashRef;
        try {
            stashRef = await this.createRestorePoint(findingId);
        }
        catch {
            return {
                appliedPatch: patchDiff,
                findingId,
                reverted: false,
                status: 'skipped',
            };
        }
        // 2. Apply patch
        try {
            await this.applyPatch(patchDiff);
        }
        catch {
            // Revert if stash was created
            if (stashRef) {
                await this.revertToRestorePoint(stashRef).catch(() => { });
            }
            return {
                appliedPatch: patchDiff,
                findingId,
                reverted: Boolean(stashRef),
                status: 'skipped',
            };
        }
        // 3. Run tests
        const testResult = await this.runTests();
        // 4. Evaluate
        if (testResult.degraded && this.autoRevert) {
            // Revert: tests degraded
            if (stashRef) {
                await this.revertToRestorePoint(stashRef).catch(() => { });
            }
            return {
                appliedPatch: patchDiff,
                baselineComparison: {
                    newFailures: testResult.newFailures,
                    resolvedFailures: testResult.resolvedFailures,
                },
                findingId,
                reverted: true,
                status: 'reverted',
                testResult,
            };
        }
        // Success: patch kept
        return {
            appliedPatch: patchDiff,
            baselineComparison: {
                newFailures: testResult.newFailures,
                resolvedFailures: testResult.resolvedFailures,
            },
            findingId,
            reverted: false,
            status: 'applied',
            testResult,
        };
    }
    /**
     * Revert to a restore point by popping the stash.
     */
    async revertToRestorePoint(stashRef) {
        if (!stashRef)
            return;
        // Reset working tree first to avoid conflicts
        await gitExec('git checkout -- .', this.projectRoot);
        const result = await gitExec(`git stash pop ${stashRef}`, this.projectRoot);
        if (result.exitCode !== 0) {
            throw new Error(`git stash pop failed: ${result.stderr}`);
        }
    }
    /**
     * Run tests via the TestRunner (twin-container execution).
     */
    async runTests() {
        return this.testRunner.run();
    }
    // ===========================================================================
    // Private
    // ===========================================================================
    shellEscape(str) {
        return `'${str.replaceAll("'", String.raw `'\''`)}'`;
    }
}
