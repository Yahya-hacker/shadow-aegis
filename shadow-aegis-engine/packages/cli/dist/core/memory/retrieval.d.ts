/**
 * Retrieval APIs - Lexical, semantic, and graph-based querying.
 */
import type { HybridResult, HybridRetriever, HybridSearchOptions } from './hybrid-retriever.js';
import type { KnowledgeGraph, TraversalOptions } from './knowledge-graph.js';
import type { BaseEntity, EntityType, GraphEdge } from './memory-schema.js';
export interface SearchResult {
    entity: BaseEntity;
    matchType: 'exact' | 'fuzzy' | 'graph';
    score: number;
}
export interface PathResult {
    confidence: number;
    edges: GraphEdge[];
    entities: BaseEntity[];
}
/**
 * Retrieval service for knowledge graph queries.
 */
export declare class Retrieval {
    private readonly graph;
    private hybridRetriever;
    constructor(graph: KnowledgeGraph);
    /**
     * Find all sources that can reach a sink.
     */
    findContributingSources(sinkId: string, options?: TraversalOptions): BaseEntity[];
    /**
     * Find data flow paths from sources to sinks.
     */
    findDataFlowPaths(sourceId: string, sinkId: string, maxDepth?: number): PathResult[];
    /**
     * Find all sinks reachable from a source.
     */
    findReachableSinks(sourceId: string, options?: TraversalOptions): BaseEntity[];
    /**
     * Get all unverified hypotheses (low confidence entities/edges).
     */
    getUnverifiedHypotheses(confidenceThreshold?: number): {
        edges: GraphEdge[];
        entities: BaseEntity[];
    };
    /**
     * Get entities related to a vulnerability.
     */
    getVulnerabilityContext(vulnId: string): {
        affectedFiles: BaseEntity[];
        exploitPath: BaseEntity[];
        relatedFunctions: BaseEntity[];
        sinks: BaseEntity[];
        sources: BaseEntity[];
    };
    /**
     * Execute a hybrid search across semantic, lexical, and graph strategies.
     * Falls back to graph-only search if HybridRetriever is not attached.
     */
    hybridSearch(query: string, options?: HybridSearchOptions): Promise<HybridResult[]>;
    /**
     * Search entities by label with fuzzy matching.
     */
    searchByLabel(query: string, options?: {
        entityType?: EntityType;
        limit?: number;
    }): SearchResult[];
    /**
     * Attach a HybridRetriever for multi-strategy search.
     * Called after semantic index initialization completes.
     */
    setHybridRetriever(retriever: HybridRetriever): void;
    /**
     * Simple string similarity (Jaccard-like on character bigrams).
     */
    private simpleSimilarity;
}
