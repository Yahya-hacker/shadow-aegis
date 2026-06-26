/**
 * Agent Worker - Autonomous specialized worker with private OODA loop.
 */
import { streamWithContinuation } from '../session.js';
import { buildWorkerSystemPrompt } from './worker-prompts.js';
import { createRoleToolSet } from './worker-toolsets.js';
/**
 * An autonomous agent worker representing a specialized role in the multi-agent swarm.
 */
export class AgentWorker {
    agentId;
    modelTier;
    role;
    trustScore;
    auditMode;
    blackboard;
    cleanupCallbacks = [];
    diffScopeHint;
    heartbeatInterval;
    isTerminated = false;
    maxOutputTokens;
    maxToolSteps;
    messages = [];
    model;
    systemPrompt;
    tools;
    constructor(options) {
        this.agentId = options.agentId;
        this.role = options.role;
        this.model = options.model;
        this.blackboard = options.blackboard;
        this.tools = createRoleToolSet(options.role, options.allTools);
        this.maxOutputTokens = options.maxOutputTokens ?? 4096;
        this.maxToolSteps = options.maxToolSteps ?? 10;
        this.auditMode = options.auditMode ?? 'sast';
        this.diffScopeHint = options.diffScopeHint ?? '';
        this.modelTier = options.modelTier ?? 'standard';
        this.trustScore = options.trustScore ?? 0.7;
        this.systemPrompt = buildWorkerSystemPrompt(options.role, {
            auditMode: this.auditMode,
            diffScope: this.diffScopeHint,
            modelTier: this.modelTier,
        });
        // Start periodic heartbeat to prevent timeouts during long tool runs
        this.heartbeatInterval = setInterval(() => {
            if (!this.isTerminated) {
                const agent = this.blackboard.getActiveAgents().find((a) => a.agentId === this.agentId);
                if (agent && agent.status !== 'offline') {
                    this.blackboard.heartbeat(this.agentId, agent.status);
                }
            }
        }, 30_000);
    }
    /**
     * Register a cleanup callback (e.g., unsubscribing from blackboard pub/sub).
     */
    addCleanupCallback(callback) {
        this.cleanupCallbacks.push(callback);
    }
    /**
     * Run the worker OODA micro-loop on a claimed task.
     */
    async executeTask(task, onActivity) {
        if (this.isTerminated) {
            throw new Error(`Worker ${this.agentId} is terminated.`);
        }
        // Heartbeat to Blackboard
        this.blackboard.heartbeat(this.agentId, 'busy');
        const userPrompt = `### TASK TO EXECUTE:
Task ID: ${task.taskId}
Type: ${task.taskType}
Priority: ${task.priority}
Description: ${task.description}
Parameters: ${JSON.stringify(task.parameters, null, 2)}

Collaborate with the swarm. Inspect the blackboard if necessary, perform your task using your tools, and submit any relevant evidence/findings to the Blackboard. When you are fully done, call finish_task.`;
        this.messages.push({
            content: userPrompt,
            role: 'user',
        });
        // Execute via streamWithContinuation
        const streamResult = await streamWithContinuation({
            maxOutputTokens: this.maxOutputTokens,
            maxToolSteps: this.maxToolSteps,
            messages: this.messages,
            model: this.model,
            onActivity: (activity) => {
                onActivity?.({
                    kind: activity.kind,
                    message: activity.summary,
                    toolName: activity.toolName,
                });
                // Periodic heartbeat during tool calls
                this.blackboard.heartbeat(this.agentId, 'busy');
            },
            onChunk() { },
            systemPrompt: this.systemPrompt,
            tools: this.tools,
        });
        this.messages.push(...streamResult.messagesDelta);
        // Heartbeat back to idle
        this.blackboard.heartbeat(this.agentId, 'idle');
        return streamResult.text;
    }
    /**
     * Terminate the worker.
     */
    terminate() {
        this.isTerminated = true;
        // Run all cleanup callbacks to prevent memory leaks
        for (const cleanup of this.cleanupCallbacks) {
            try {
                cleanup();
            }
            catch (error) {
                console.error(`Error in cleanup callback for worker ${this.agentId}:`, error);
            }
        }
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        this.blackboard.heartbeat(this.agentId, 'offline');
    }
}
