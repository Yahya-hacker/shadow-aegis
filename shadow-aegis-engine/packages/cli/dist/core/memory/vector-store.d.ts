/**
 * Vector Store - Lightweight embedded vector database.
 * Zero-dependency, filesystem-backed cosine similarity search.
 * Replaces external vectra dependency for air-gapped deployments.
 */
export interface VectorEntry {
    id: string;
    metadata: Record<string, unknown>;
    vector: number[];
}
export interface VectorSearchResult {
    entry: VectorEntry;
    score: number;
}
export interface VectorStoreState {
    entries: VectorEntry[];
    schemaVersion: string;
    snapshotAt: string;
}
/**
 * Lightweight, file-backed vector store.
 * Supports cosine similarity search and metadata filtering.
 */
export declare class VectorStore {
    private entries;
    private readonly snapshotPath;
    private constructor();
    /**
     * Create or load a vector store.
     */
    static create(storagePath: string): Promise<VectorStore>;
    /**
     * Number of entries in the store.
     */
    get size(): number;
    /**
     * Delete an entry by ID.
     */
    delete(id: string): boolean;
    /**
     * Delete entries matching a metadata filter.
     */
    deleteByMetadata(filter: Record<string, unknown>): number;
    /**
     * Get an entry by ID.
     */
    get(id: string): undefined | VectorEntry;
    /**
     * Check if an entry exists.
     */
    has(id: string): boolean;
    /**
     * Save store to disk.
     */
    saveSnapshot(): Promise<void>;
    /**
     * Search for nearest neighbors using cosine similarity.
     */
    search(queryVector: number[], options?: {
        filter?: Record<string, unknown>;
        minScore?: number;
        topK?: number;
    }): VectorSearchResult[];
    /**
     * Upsert a vector entry.
     */
    upsert(entry: VectorEntry): void;
    /**
     * Upsert multiple vector entries.
     */
    upsertBatch(entries: VectorEntry[]): void;
    /**
     * Load store from disk.
     */
    private loadSnapshot;
    /**
     * Check if metadata matches a filter (MongoDB-style partial match).
     */
    private matchesFilter;
}
