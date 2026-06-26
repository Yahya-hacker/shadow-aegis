/**
 * Semantic Index - Code-aware chunking, embedding, and vector retrieval.
 *
 * Uses Tree-sitter for AST-aware chunking at function/class boundaries,
 * captures parent scope context (imports, class declarations) per chunk,
 * and generates embeddings via a configurable provider (Ollama default,
 * OpenAI optional) stored in the local VectorStore.
 *
 * Design note: Overlapping sliding windows include the immediate parent
 * scope (e.g., class imports, surrounding class declaration) so that
 * functions are never analyzed completely out of their file context.
 * This prevents hallucination of missing types or global variables.
 */
export interface CodeChunk {
    /** SHA-256 of the raw content for deduplication */
    contentHash: string;
    /** End line (1-indexed, inclusive) */
    endLine: number;
    /** Absolute file path */
    filePath: string;
    /** Unique chunk identifier */
    id: string;
    /** Detected language */
    language: string;
    /** Parent scope context (imports, class header) prepended for coherence */
    parentContext: string;
    /** The raw source code of this chunk */
    rawContent: string;
    /** Start line (1-indexed, inclusive) */
    startLine: number;
    /** Structural type: 'function' | 'class' | 'method' | 'interface' | 'file_fragment' */
    structuralType: string;
    /** Human-readable label (function name, class name, etc.) */
    symbol: string;
}
export interface EmbeddingProvider {
    /** Dimension of the embedding vectors produced */
    dimension: number;
    /** Generate embeddings for a batch of texts */
    embed(texts: string[]): Promise<number[][]>;
    /** Provider name for logging */
    name: string;
}
export interface SemanticIndexOptions {
    /** Maximum tokens per chunk (approximate, character-based) */
    maxChunkChars?: number;
    /** Embedding provider instance */
    provider: EmbeddingProvider;
    /** Root directory of the target repository */
    rootPath: string;
    /** Directory for persisting the vector store */
    storagePath: string;
}
export interface SemanticSearchResult {
    chunk: CodeChunk;
    score: number;
}
export interface IndexingProgress {
    currentFile: string;
    filesIndexed: number;
    totalFiles: number;
}
/**
 * Ollama-based local embedding provider.
 * Default for zero-data-leakage in security tooling.
 */
export declare class OllamaEmbeddingProvider implements EmbeddingProvider {
    readonly dimension: number;
    readonly name = "ollama";
    private readonly baseUrl;
    private readonly model;
    constructor(options?: {
        baseUrl?: string;
        dimension?: number;
        model?: string;
    });
    embed(texts: string[]): Promise<number[][]>;
}
/**
 * OpenAI embedding provider (optional, for users who prioritize speed).
 */
export declare class OpenAIEmbeddingProvider implements EmbeddingProvider {
    readonly dimension: number;
    readonly name = "openai";
    private readonly apiKey;
    private readonly model;
    constructor(options: {
        apiKey: string;
        dimension?: number;
        model?: string;
    });
    embed(texts: string[]): Promise<number[][]>;
}
/**
 * Null embedding provider for testing or when embeddings are unavailable.
 * Generates deterministic pseudo-random vectors from content hashes.
 */
export declare class NullEmbeddingProvider implements EmbeddingProvider {
    readonly dimension: number;
    readonly name = "null";
    constructor(dimension?: number);
    embed(texts: string[]): Promise<number[][]>;
    private deterministicVector;
}
/**
 * Semantic Index for code-aware retrieval.
 *
 * Combines Tree-sitter AST parsing for structural chunking with
 * vector embeddings for semantic similarity search. The index is
 * persisted to disk and supports incremental updates.
 */
export declare class SemanticIndex {
    private chunks;
    private fileChunkIndex;
    private initialized;
    private readonly maxChunkChars;
    private readonly parser;
    private readonly provider;
    private readonly rootPath;
    private readonly storagePath;
    private vectorStore;
    constructor(options: SemanticIndexOptions);
    /**
     * Get all chunks across all files.
     */
    getAllChunks(): CodeChunk[];
    /**
     * Get a chunk by ID.
     */
    getChunk(chunkId: string): CodeChunk | undefined;
    /**
     * Get all chunks for a file.
     */
    getChunksForFile(filePath: string): CodeChunk[];
    /**
     * Get all indexed file paths.
     */
    getIndexedFilePaths(): string[];
    /**
     * Index a single file, returning the number of chunks created.
     */
    indexFile(filePath: string): Promise<number>;
    /**
     * Index the entire repository.
     */
    indexRepository(onProgress?: (progress: IndexingProgress) => void): Promise<{
        chunksIndexed: number;
        filesIndexed: number;
    }>;
    /**
     * Initialize the index, loading any persisted state.
     */
    initialize(): Promise<void>;
    /**
     * Remove all chunks for a file (for re-indexing).
     */
    invalidateFile(filePath: string): void;
    /**
     * Semantic search: find code chunks most relevant to a natural language query.
     */
    search(query: string, options?: {
        fileFilter?: string;
        language?: string;
        minScore?: number;
        structuralType?: string;
        topK?: number;
    }): Promise<SemanticSearchResult[]>;
    /**
     * Get index statistics.
     */
    stats(): {
        chunkCount: number;
        chunksByType: Record<string, number>;
        fileCount: number;
        vectorCount: number;
    };
    /**
     * Build the text that gets embedded.
     * Includes parent context for coherence (imports, class header).
     */
    private buildEmbeddingText;
    private ensureInitialized;
    /**
     * Load chunk metadata from disk.
     */
    private loadChunkMetadata;
    /**
     * Save chunk metadata to disk.
     */
    private saveChunkMetadata;
}
