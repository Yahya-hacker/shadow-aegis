/**
 * Event Store - Append-only event log for audit trail and replay.
 * Persists to JSONL format for streaming and recovery.
 */
import { type Result } from '../schema/base.js';
import { type Event, type EventType } from './memory-schema.js';
export interface EventStoreOptions {
    runId: string;
    storagePath: string;
}
export interface EventFilter {
    afterTimestamp?: string;
    beforeTimestamp?: string;
    eventTypes?: EventType[];
    limit?: number;
}
/**
 * Append-only event store with JSONL persistence.
 * Supports streaming reads and atomic appends.
 */
export declare class EventStore {
    private readonly eventsPath;
    private readonly runId;
    private writeQueue;
    private constructor();
    /**
     * Create or open an event store.
     */
    static create(options: EventStoreOptions): Promise<EventStore>;
    /**
     * Append an event to the log.
     * Thread-safe via write queue serialization.
     */
    append(eventType: EventType, payload: Record<string, unknown>): Promise<Result<Event, string>>;
    /**
     * Count total events.
     */
    count(): Promise<number>;
    /**
     * Get events of a specific type.
     */
    getByType(eventType: EventType, limit?: number): Promise<Result<Event[], string>>;
    /**
     * Read all events, optionally filtered.
     */
    read(filter?: EventFilter): Promise<Result<Event[], string>>;
    /**
     * Generate a unique event ID.
     */
    private generateEventId;
}
