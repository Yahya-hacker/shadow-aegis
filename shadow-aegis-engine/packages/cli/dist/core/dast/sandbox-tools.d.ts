/**
 * Sandbox Tools - Agent-facing tools for DAST sandbox operations.
 *
 * Provides the verifier and exploit-analyst agents with tools to:
 * - Execute commands inside the sandboxed target container
 * - Deploy the target application
 * - Check sandbox and Mirage OAST status
 * - Query OAST callback logs for exploit validation
 */
import { type ToolSet } from 'ai';
import { type SandboxManager } from './sandbox-manager.js';
export interface SandboxToolsOptions {
    sandboxManager: SandboxManager;
}
/**
 * Create agent-facing sandbox tools for verifier and exploit-analyst roles.
 */
export declare function createSandboxTools(options: SandboxToolsOptions): ToolSet;
