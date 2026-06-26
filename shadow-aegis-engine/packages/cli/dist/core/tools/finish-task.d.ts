/**
 * Creates a finish_task tool that the agent calls to signal task completion.
 *
 * When combined with `hasToolCall('finish_task')` as a stopWhen predicate in
 * `streamWithContinuation`, this enables the agent to self-terminate its
 * multi-step tool loop once all analysis goals have been met — without waiting
 * for the step budget to be fully consumed.
 *
 * Usage pattern:
 *   stopWhen: [stepCountIs(maxToolSteps), hasToolCall('finish_task')]
 */
export declare function createFinishTaskTool(): import("ai").Tool<{
    summary: string;
}, string>;
