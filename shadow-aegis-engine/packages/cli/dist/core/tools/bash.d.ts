import { type CommandPolicyConfig } from '../policy/command-policy.js';
export interface BashToolOptions {
    commandPolicy: CommandPolicyConfig;
    workingDirectory: string;
}
/**
 * Creates a bash tool that provides a safe, controlled interface for Unix shell commands.
 * Enables the agent to chain standard Unix tools (grep, sed, jq, awk, find, etc.)
 * without coding each operation from scratch. All commands are policy-gated,
 * sandboxed to the workspace, and audit-logged via the tool-events pipeline.
 */
export declare function createBashTool(options: BashToolOptions): import("ai").Tool<{
    command: string;
    timeout?: number | undefined;
}, string>;
