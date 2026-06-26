/**
 * Evidence Linker - Links findings to concrete evidence.
 */
import type { KnowledgeGraph } from '../memory/knowledge-graph.js';
import type { CodeEvidence } from '../schema/base.js';
export interface ToolRunRef {
    toolCallId: string;
    toolName: string;
    truncated: boolean;
}
export interface EvidenceLink {
    code?: CodeEvidence[];
    entityIds: string[];
    toolRuns?: ToolRunRef[];
    totalWeight: number;
}
export interface LinkingResult {
    coverage: number;
    gaps: string[];
    links: EvidenceLink;
    strength: 'moderate' | 'none' | 'strong' | 'weak';
}
export interface EvidenceItem {
    description?: string;
    evidence?: CodeEvidence | ToolRunRef;
    type: 'code' | 'manual' | 'tool_run';
}
/**
 * Links findings to concrete evidence from the knowledge graph.
 */
export declare class EvidenceLinker {
    private readonly graph;
    constructor(graph: KnowledgeGraph);
    /**
     * Get all evidence for an entity.
     */
    getEntityEvidence(entityId: string): EvidenceItem[];
    /**
     * Link a finding to available evidence.
     */
    linkFinding(title: string, entityIds: string[], toolRunRefs: ToolRunRef[]): LinkingResult;
    /**
     * Verify source-to-sink path has evidence.
     */
    verifyDataFlowEvidence(sourceId: string, sinkId: string, intermediateIds: string[]): {
        coverage: number;
        gaps: string[];
        hasPath: boolean;
    };
    /**
     * Extract code evidence from an entity if available.
     */
    private extractCodeEvidence;
}
