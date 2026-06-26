import { type FinishReason, type LanguageModel, type ModelMessage, type StepResult, type ToolSet } from 'ai';
export declare const CONTINUATION_PROMPT = "Continue exactly where you left off. Do not repeat content.";
/**
 * Returns a stopWhen predicate array for use in streamText.
 * Stops the tool loop when either:
 *   1. The step budget is exhausted (stepCountIs), OR
 *   2. The agent explicitly calls the `finish_task` tool (hasToolCall)
 *
 * This implements the "stopWhen: finish_task" agentic capability from the
 * problem statement, enabling the agent to self-terminate when goals are met.
 */
export declare function buildStopConditions(maxToolSteps: number): import("ai").StopCondition<any>[];
export interface StreamWithContinuationOptions<TOOLS extends ToolSet> {
    maxContinuations?: number;
    maxOutputTokens: number;
    maxToolSteps: number;
    messages: ModelMessage[];
    model: LanguageModel;
    onActivity?: (activity: StreamActivity) => void;
    onChunk: (chunk: string) => void;
    systemPrompt: string;
    tools: TOOLS;
}
export interface StreamWithContinuationResult<TOOLS extends ToolSet> {
    continuationCount: number;
    finishReason: FinishReason;
    messagesDelta: ModelMessage[];
    rawFinishReason: string | undefined;
    steps: Array<StepResult<TOOLS>>;
    text: string;
}
export interface StreamActivity {
    kind: 'tool_call' | 'tool_result';
    summary: string;
    toolCallId: string;
    toolName: string;
}
export declare function stitchResponseChunks(base: string, addition: string): string;
export declare function isTruncatedResponse(finishReason: FinishReason, rawFinishReason?: string): boolean;
export declare function extractStepActivities<TOOLS extends ToolSet>(steps: Array<StepResult<TOOLS>>): StreamActivity[];
export declare function streamWithContinuation<TOOLS extends ToolSet>({ maxContinuations, maxOutputTokens, maxToolSteps, messages, model, onActivity, onChunk, systemPrompt, tools, }: StreamWithContinuationOptions<TOOLS>): Promise<StreamWithContinuationResult<TOOLS>>;
