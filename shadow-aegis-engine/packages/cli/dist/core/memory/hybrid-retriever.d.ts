/**
 * Hybrid Retriever - Multi-strategy code retrieval with Reciprocal Rank Fusion.
 *
 * Combines three retrieval strategies:
 *   1. Graph-based: KnowledgeGraph entity/edge traversal
 *   2. Lexical: ripgrep-powered keyword search
 *   3. Semantic: Vector similarity search via SemanticIndex
 *
 * Results are merged using Reciprocal Rank Fusion (RRF) to produce a
 * unified, deduplicated ranking. Configurable weights allow tuning
 * the contribution of each strategy.
 */
import type { KnowledgeGraph } from './knowledge-graph.js';
import type { BaseEntity } from './memory-schema.js';
import type { Retrieval } from './retrieval.js';
import type { CodeChunk, SemanticIndex } from './semantic-index.js';
export interface HybridResult {
    /** The code chunk (present for semantic/lexical results) */
    chunk?: CodeChunk;
    /** The knowledge graph entity (present for graph results) */
    entity?: BaseEntity;
    /** Which file this result refers to */
    filePath: string;
    /** Fused score from RRF */
    fusedScore: number;
    /** Line range in the file */
    lineRange?: {
        end: number;
        start: number;
    };
    /** Human-readable match description */
    matchDescription: string;
    /** Provenance: which strategies contributed to this result */
    provenance: HybridResultProvenance[];
    /** The actual code content */
    text: string;
}
export interface HybridResultProvenance {
    /** Rank within that strategy's results */
    rank: number;
    /** Raw score from the strategy */
    score: number;
    /** Which retrieval strategy produced this */
    strategy: RetrievalStrategy;
}
export type RetrievalStrategy = 'graph' | 'lexical' | 'semantic';
export interface HybridRetrieverOptions {
    /** Maximum results to return */
    maxResults?: number;
    /** Root path of the target repository */
    rootPath: string;
    /** RRF constant k (default: 60, standard RRF value) */
    rrfK?: number;
    /** Per-strategy weights (must sum to ~1.0) */
    weights?: Partial<Record<RetrievalStrategy, number>>;
}
export interface HybridSearchOptions {
    /** Only include results from files matching this glob/substring */
    fileFilter?: string;
    /** Maximum results */
    maxResults?: number;
    /** Only include results from specific strategies */
    strategies?: RetrievalStrategy[];
}
/**
 * Multi-strategy code retriever with Reciprocal Rank Fusion.
 */
export declare class HybridRetriever {
    private readonly graph;
    private readonly maxResults;
    private readonly retrieval;
    private readonly rootPath;
    private readonly rrfK;
    private readonly semanticIndex;
    private readonly weights;
    constructor(graph: KnowledgeGraph, retrieval: Retrieval, semanticIndex: SemanticIndex, options: HybridRetrieverOptions);
    /**
     * Get all indexed chunks (for lexical search access).
     */
    getAllChunks(): CodeChunk[];
    /**
     * Execute a hybrid search across all strategies and fuse results.
     */
    search(query: string, options?: HybridSearchOptions): Promise<HybridResult[]>;
    private executeGraphStrategy;
    private executeLexicalStrategy;
    private executeSemanticStrategy;
    /**
     * Fuse results from multiple strategies using Reciprocal Rank Fusion.
     */
    private fuseResults;
}
