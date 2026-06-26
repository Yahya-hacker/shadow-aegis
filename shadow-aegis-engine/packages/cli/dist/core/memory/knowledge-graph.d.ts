/**
 * Knowledge Graph - Graph-native entity and relationship storage.
 * Supports deterministic deduplication, typed edges, and traversal queries.
 */
import { type Result } from '../schema/base.js';
import { type BaseEntity, type EdgeType, type EntityType, type GraphEdge } from './memory-schema.js';
export interface KnowledgeGraphOptions {
    runId: string;
    storagePath: string;
}
export interface TraversalOptions {
    direction?: 'both' | 'inbound' | 'outbound';
    edgeTypes?: EdgeType[];
    maxDepth?: number;
    minConfidence?: number;
}
/**
 * In-memory knowledge graph with persistence.
 * Enforces deduplication and schema validation on all operations.
 */
export declare class KnowledgeGraph {
    private edges;
    private entities;
    private entitiesByType;
    private inboundEdges;
    private outboundEdges;
    private readonly runId;
    private readonly snapshotPath;
    private constructor();
    /**
     * Create or load a knowledge graph.
     */
    static create(options: KnowledgeGraphOptions): Promise<KnowledgeGraph>;
    /**
     * Add an edge between entities.
     * Returns error if source or target entity doesn't exist.
     */
    addEdge(edgeType: EdgeType, sourceEntityId: string, targetEntityId: string, options?: {
        confidence?: number;
        metadata?: Record<string, unknown>;
        validated?: boolean;
    }): Result<GraphEdge, string>;
    /**
     * Add or merge an entity.
     * Returns true if this was a new entity, false if merged with existing.
     */
    addEntity(entity: BaseEntity): {
        entity: BaseEntity;
        isNew: boolean;
    };
    /**
     * Find paths between two entities.
     */
    findPaths(sourceId: string, targetId: string, maxDepth?: number): Array<{
        edges: GraphEdge[];
        entities: BaseEntity[];
    }>;
    /**
     * Get an edge by ID.
     */
    getEdge(edgeId: string): GraphEdge | undefined;
    /**
     * Get all entities of a specific type.
     */
    getEntitiesByType(entityType: EntityType): BaseEntity[];
    /**
     * Get an entity by canonical ID.
     */
    getEntity(canonicalId: string): BaseEntity | undefined;
    /**
     * Get all edges to a target entity.
     */
    getInboundEdges(targetEntityId: string, edgeType?: EdgeType): GraphEdge[];
    /**
     * Get all edges from a source entity.
     */
    getOutboundEdges(sourceEntityId: string, edgeType?: EdgeType): GraphEdge[];
    /**
     * Query entities matching criteria.
     */
    query(criteria: {
        entityType?: EntityType;
        labelContains?: string;
        minConfidence?: number;
        propertyMatches?: Record<string, unknown>;
    }): BaseEntity[];
    /**
     * Save graph to disk.
     */
    saveSnapshot(): Promise<void>;
    /**
     * Get graph statistics.
     */
    stats(): {
        edgeCount: number;
        edgesByType: Record<string, number>;
        entitiesByType: Record<string, number>;
        entityCount: number;
    };
    /**
     * Traverse the graph from a starting entity.
     */
    traverse(startEntityId: string, options?: TraversalOptions): BaseEntity[];
    private indexEdge;
    private indexEntityByType;
    /**
     * Load graph from disk.
     */
    private loadSnapshot;
}
