/**
 * Task Graph - Dependency-aware task management.
 */
import { type Result } from '../schema/base.js';
import { type AgentRole, type Task, type TaskPriority, type TaskStatus } from './hivemind-schema.js';
export interface CreateTaskInput {
    dependencies?: string[];
    description: string;
    parameters?: Record<string, unknown>;
    priority?: TaskPriority;
    requiredRole?: AgentRole;
    taskType: string;
    timeout?: number;
}
/**
 * Manages tasks with dependency tracking.
 */
export declare class TaskGraph {
    private taskDependents;
    private tasks;
    private tasksByStatus;
    constructor();
    /**
     * Cancel a task.
     */
    cancelTask(taskId: string): Result<Task, string>;
    /**
     * Claim a task for an agent.
     */
    claimTask(taskId: string, agentId: string): Result<Task, string>;
    /**
     * Complete a task.
     */
    completeTask(taskId: string, result?: unknown): Result<Task, string>;
    /**
     * Create a new task.
     */
    createTask(input: CreateTaskInput): Result<Task, string>;
    /**
     * Export tasks for persistence.
     */
    exportTasks(): Task[];
    /**
     * Fail a task.
     */
    failTask(taskId: string, errorMessage: string): Result<Task, string>;
    /**
     * Get all tasks.
     */
    getAllTasks(): Task[];
    /**
     * Get tasks that are ready to be claimed (pending with satisfied dependencies).
     */
    getClaimableTasks(role?: AgentRole): Task[];
    /**
     * Get tasks sorted by priority.
     */
    getPrioritizedTasks(): Task[];
    /**
     * Get task statistics.
     */
    getStats(): Record<TaskStatus, number>;
    /**
     * Get a task by ID.
     */
    getTask(taskId: string): Task | undefined;
    /**
     * Get tasks by status.
     */
    getTasksByStatus(status: TaskStatus): Task[];
    /**
     * Import tasks from persistence.
     */
    importTasks(tasks: Task[]): void;
    /**
     * Release a claimed task back to pending.
     */
    releaseTask(taskId: string): Result<Task, string>;
    /**
     * Start working on a claimed task.
     */
    startTask(taskId: string): Result<Task, string>;
    private areDependenciesSatisfied;
    private determineInitialStatus;
    private indexTask;
    private updateBlockedDependents;
    private updateTaskInternal;
    private wouldCreateCycle;
}
