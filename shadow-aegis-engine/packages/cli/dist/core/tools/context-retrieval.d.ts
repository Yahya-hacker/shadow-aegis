/**
 * Context Retrieval Tool - On-demand hybrid code retrieval for the agent.
 *
 * Replaces the static repo-map context window dump with a dynamic tool
 * that the agent can invoke to pull relevant code chunks on-demand.
 * Uses the HybridRetriever (semantic + lexical + graph) to find the
 * most relevant code for the agent's current analysis task.
 */
import type { HybridRetriever } from '../memory/hybrid-retriever.js';
export interface ContextRetrievalToolOptions {
    retriever: HybridRetriever;
    rootPath: string;
}
export declare function createContextRetrievalTool(options: ContextRetrievalToolOptions): import("ai").Tool<{
    query: string;
    fileFilter?: string | undefined;
    maxResults?: number | undefined;
    strategy?: "graph" | "lexical" | "semantic" | "hybrid" | undefined;
}, string>;
