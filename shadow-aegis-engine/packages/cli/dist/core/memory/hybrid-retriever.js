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
// ============================================================================
// Lexical Search (ripgrep-style in-process)
// ============================================================================
/**
 * Simple in-process lexical search.
 * Searches code chunks by keyword matching (case-insensitive).
 */
function lexicalSearch(query, chunks, options = {}) {
    const queryTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    if (queryTerms.length === 0) {
        return [];
    }
    const results = [];
    for (const chunk of chunks) {
        if (options.fileFilter && !chunk.filePath.includes(options.fileFilter)) {
            continue;
        }
        const searchText = `${chunk.symbol} ${chunk.rawContent}`.toLowerCase();
        let matchCount = 0;
        let totalMatches = 0;
        for (const term of queryTerms) {
            const termMatches = countOccurrences(searchText, term);
            if (termMatches > 0) {
                matchCount++;
                totalMatches += termMatches;
            }
        }
        if (matchCount === 0) {
            continue;
        }
        // Score: combination of term coverage and match density
        const termCoverage = matchCount / queryTerms.length;
        const density = Math.min(1, totalMatches / (searchText.length / 100));
        const score = termCoverage * 0.7 + density * 0.3;
        results.push({ chunk, score });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, options.maxResults ?? 20);
}
/**
 * Count non-overlapping occurrences of a substring.
 */
function countOccurrences(text, term) {
    let count = 0;
    let pos = 0;
    while ((pos = text.indexOf(term, pos)) !== -1) {
        count++;
        pos += term.length;
    }
    return count;
}
// ============================================================================
// Reciprocal Rank Fusion
// ============================================================================
/**
 * Compute Reciprocal Rank Fusion score.
 * RRF(d) = Σ 1 / (k + rank_i(d))
 * where k is a constant (default 60) and rank_i is the rank from strategy i.
 */
function computeRRFScore(ranks, k) {
    return ranks.reduce((sum, { rank, weight }) => sum + weight / (k + rank), 0);
}
// ============================================================================
// Hybrid Retriever
// ============================================================================
/**
 * Multi-strategy code retriever with Reciprocal Rank Fusion.
 */
export class HybridRetriever {
    graph;
    maxResults;
    retrieval;
    rootPath;
    rrfK;
    semanticIndex;
    weights;
    constructor(graph, retrieval, semanticIndex, options) {
        this.graph = graph;
        this.retrieval = retrieval;
        this.semanticIndex = semanticIndex;
        this.rootPath = options.rootPath;
        this.maxResults = options.maxResults ?? 15;
        this.rrfK = options.rrfK ?? 60;
        this.weights = {
            graph: options.weights?.graph ?? 0.3,
            lexical: options.weights?.lexical ?? 0.2,
            semantic: options.weights?.semantic ?? 0.5,
        };
    }
    /**
     * Get all indexed chunks (for lexical search access).
     */
    getAllChunks() {
        return this.semanticIndex.getAllChunks();
    }
    /**
     * Execute a hybrid search across all strategies and fuse results.
     */
    async search(query, options = {}) {
        const strategies = options.strategies ?? ['semantic', 'lexical', 'graph'];
        const maxResults = options.maxResults ?? this.maxResults;
        const perStrategyLimit = maxResults * 3; // Fetch more per strategy for better fusion
        // Execute enabled strategies in parallel
        const strategyResults = [];
        const promises = [];
        if (strategies.includes('semantic')) {
            promises.push(this.executeSemanticStrategy(query, perStrategyLimit, options.fileFilter));
        }
        if (strategies.includes('lexical')) {
            promises.push(this.executeLexicalStrategy(query, perStrategyLimit, options.fileFilter));
        }
        if (strategies.includes('graph')) {
            promises.push(this.executeGraphStrategy(query, perStrategyLimit));
        }
        const results = await Promise.allSettled(promises);
        for (const result of results) {
            if (result.status === 'fulfilled') {
                strategyResults.push(...result.value);
            }
        }
        // Fuse results using RRF
        return this.fuseResults(strategyResults, maxResults);
    }
    // ==========================================================================
    // Strategy Implementations
    // ==========================================================================
    async executeGraphStrategy(query, limit) {
        try {
            // Search the knowledge graph for entities matching the query
            const searchResults = this.retrieval.searchByLabel(query, { limit });
            return searchResults.map((r, index) => {
                // Extract file path from entity properties
                const props = r.entity.properties;
                const filePath = props.path ?? props.fileCanonicalId ?? '';
                return {
                    dedupKey: r.entity.canonicalId,
                    filePath,
                    matchDescription: `Graph match: ${r.entity.label} (${r.entity.entityType})`,
                    payload: { entity: r.entity },
                    rank: index + 1,
                    score: r.score,
                    strategy: 'graph',
                    text: `// ${r.entity.entityType}: ${r.entity.label}\n${JSON.stringify(r.entity.properties, null, 2)}`,
                };
            });
        }
        catch (error) {
            console.warn(`[HybridRetriever] Graph search failed: ${error.message}`);
            return [];
        }
    }
    async executeLexicalStrategy(query, limit, fileFilter) {
        try {
            const allChunks = this.getAllChunks();
            const results = lexicalSearch(query, allChunks, { fileFilter, maxResults: limit });
            return results.map((r, index) => ({
                dedupKey: `${r.chunk.filePath}:${r.chunk.startLine}`,
                filePath: r.chunk.filePath,
                lineRange: { end: r.chunk.endLine, start: r.chunk.startLine },
                matchDescription: `Lexical match: ${r.chunk.symbol} (${r.chunk.structuralType})`,
                payload: { chunk: r.chunk },
                rank: index + 1,
                score: r.score,
                strategy: 'lexical',
                text: r.chunk.rawContent,
            }));
        }
        catch (error) {
            console.warn(`[HybridRetriever] Lexical search failed: ${error.message}`);
            return [];
        }
    }
    async executeSemanticStrategy(query, limit, fileFilter) {
        try {
            const results = await this.semanticIndex.search(query, {
                fileFilter,
                topK: limit,
            });
            return results.map((r, index) => ({
                dedupKey: `${r.chunk.filePath}:${r.chunk.startLine}`,
                filePath: r.chunk.filePath,
                lineRange: { end: r.chunk.endLine, start: r.chunk.startLine },
                matchDescription: `Semantic match: ${r.chunk.symbol} (${r.chunk.structuralType})`,
                payload: { chunk: r.chunk },
                rank: index + 1,
                score: r.score,
                strategy: 'semantic',
                text: r.chunk.parentContext
                    ? `${r.chunk.parentContext}\n\n${r.chunk.rawContent}`
                    : r.chunk.rawContent,
            }));
        }
        catch (error) {
            console.warn(`[HybridRetriever] Semantic search failed: ${error.message}`);
            return [];
        }
    }
    // ==========================================================================
    // Fusion
    // ==========================================================================
    /**
     * Fuse results from multiple strategies using Reciprocal Rank Fusion.
     */
    fuseResults(allResults, maxResults) {
        // Group by dedup key
        const grouped = new Map();
        for (const result of allResults) {
            const existing = grouped.get(result.dedupKey) ?? [];
            existing.push(result);
            grouped.set(result.dedupKey, existing);
        }
        // Compute RRF score for each unique result
        const fused = [];
        for (const [dedupKey, results] of grouped) {
            const ranks = results.map((r) => ({
                rank: r.rank,
                weight: this.weights[r.strategy],
            }));
            const fusedScore = computeRRFScore(ranks, this.rrfK);
            const provenance = results.map((r) => ({
                rank: r.rank,
                score: r.score,
                strategy: r.strategy,
            }));
            // Use the highest-ranked result's data as the canonical representation
            const primary = results.sort((a, b) => a.rank - b.rank)[0];
            fused.push({
                chunk: primary.payload.chunk,
                entity: primary.payload.entity,
                filePath: primary.filePath,
                fusedScore,
                lineRange: primary.lineRange,
                matchDescription: primary.matchDescription,
                provenance,
                text: primary.text,
            });
        }
        // Sort by fused score descending
        fused.sort((a, b) => b.fusedScore - a.fusedScore);
        return fused.slice(0, maxResults);
    }
}
