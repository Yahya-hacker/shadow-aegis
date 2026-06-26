/**
 * Remediation Tools - Agent-facing tools for the patch-engineer worker.
 *
 * These tools wrap the TestRunner and RemediationLoop for swarm agent use.
 * The patch-engineer uses these to apply patches, run tests inside
 * twin containers, and auto-revert on degradation.
 */
import { type ToolSet } from 'ai';
import { RemediationLoop } from './remediation-loop.js';
import { type TestRunner } from './test-runner.js';
export interface RemediationToolsOptions {
    projectRoot: string;
    remediationLoop: RemediationLoop;
    testRunner: TestRunner;
}
/**
 * Create agent-facing remediation tools for the patch-engineer role.
 */
export declare function createRemediationTools(options: RemediationToolsOptions): ToolSet;
