import type { AuditMode } from './model-capabilities.js';
export interface SystemPromptContext {
    auditMode: AuditMode;
    diffScope?: string;
    mcpEnabled: boolean;
}
export declare function buildSystemPrompt(context: SystemPromptContext): string;
