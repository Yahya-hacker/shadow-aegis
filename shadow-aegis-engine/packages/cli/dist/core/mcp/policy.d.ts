import type { MCPToolDefinition } from './types.js';
export interface MCPPolicyDecision {
    allowed: boolean;
    reason: string;
    warning?: string;
}
export declare function evaluateMcpPolicy(adapterId: string, toolDefinition: MCPToolDefinition, expertUnsafe: boolean): MCPPolicyDecision;
