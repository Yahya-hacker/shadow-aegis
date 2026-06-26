export interface CommandPolicyConfig {
    additionalAllowedCommandPatterns?: string[];
    additionalDeniedPatterns?: string[];
    allowPnpmYarn?: boolean;
    expertUnsafe?: boolean;
}
export interface CommandPolicyDecision {
    allowed: boolean;
    reason: string;
    warning?: string;
}
export declare function evaluateCommandPolicy(command: string, config?: CommandPolicyConfig): CommandPolicyDecision;
