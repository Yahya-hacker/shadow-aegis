/**
 * Checkpoints - Persistent mission state snapshots for recovery.
 */
import { type Result } from '../schema/base.js';
import { type MissionState } from './mission-state.js';
export interface CheckpointMetadata {
    checkpointId: string;
    createdAt: string;
    missionId: string;
    phase: string;
    stateHash: string;
}
export interface CheckpointManagerOptions {
    maxCheckpoints?: number;
    runId: string;
    storagePath: string;
}
/**
 * Manages persistent checkpoints for mission state recovery.
 */
export declare class CheckpointManager {
    private readonly checkpointsDir;
    private readonly maxCheckpoints;
    private readonly runId;
    constructor(options: CheckpointManagerOptions);
    /**
     * Delete a checkpoint.
     */
    deleteCheckpoint(checkpointId: string): Promise<Result<void, string>>;
    /**
     * Initialize the checkpoint storage.
     */
    initialize(): Promise<void>;
    /**
     * List all checkpoints for this run.
     */
    listCheckpoints(): Promise<Result<CheckpointMetadata[], string>>;
    /**
     * Load a checkpoint by ID.
     */
    loadCheckpoint(checkpointId: string): Promise<Result<MissionState, string>>;
    /**
     * Load the most recent checkpoint.
     */
    loadLatestCheckpoint(): Promise<Result<MissionState | null, string>>;
    /**
     * Save a checkpoint of the current mission state.
     */
    saveCheckpoint(state: MissionState): Promise<Result<CheckpointMetadata, string>>;
    /**
     * Clean up old checkpoints to stay within limit.
     */
    private cleanupOldCheckpoints;
}
/**
 * Compute a hash of the state for change detection.
 */
export declare function computeStateHash(state: MissionState): string;
