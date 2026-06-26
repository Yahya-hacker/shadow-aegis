import { type CommandPolicyConfig } from '../policy/command-policy.js';
export interface ExecuteCommandToolOptions {
    commandPolicy: CommandPolicyConfig;
    workingDirectory: string;
}
export declare function createExecuteCommandTool(options: ExecuteCommandToolOptions): import("ai").Tool<{
    command: string;
}, string>;
