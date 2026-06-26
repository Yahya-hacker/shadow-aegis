/**
 * Human-in-the-Loop utilities for agentic tool confirmations using React/Ink.
 * Provides secure user prompts for dangerous operations like file edits and command execution.
 */
/**
 * Asks user for confirmation before applying a file edit.
 * Returns true if user approves, false if denied.
 */
export declare function confirmFileEdit(filePath: string, targetCode: string, replacementCode: string): Promise<boolean>;
/**
 * Asks user for confirmation before executing a command.
 * Returns true if user approves, false if denied.
 */
export declare function confirmCommandExecution(command: string, warning?: string): Promise<boolean>;
export declare function confirmMcpToolExecution(adapterName: string, toolName: string, payload: unknown, warning?: string): Promise<boolean>;
