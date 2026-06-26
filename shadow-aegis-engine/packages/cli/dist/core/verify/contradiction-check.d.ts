/**
 * Contradiction Check - Detect conflicting evidence.
 */
import type { KnowledgeGraph } from '../memory/knowledge-graph.js';
export interface Contradiction {
    description: string;
    entityIds: string[];
    severity: 'critical' | 'major' | 'minor';
    type: ContradictionType;
}
export type ContradictionType = 'confidence_mismatch' | 'conflicting_status' | 'duplicate_finding' | 'impossible_flow' | 'temporal_inconsistency';
export interface ContradictionCheckResult {
    contradictions: Contradiction[];
    hasBlockingContradictions: boolean;
    recommendations: string[];
}
/**
 * Checks for contradictory evidence in the knowledge graph.
 */
export declare class ContradictionChecker {
    private readonly graph;
    constructor(graph: KnowledgeGraph);
    /**
     * Check for contradictions related to a finding.
     */
    checkFinding(findingTitle: string, sourceId?: string, sinkId?: string, relatedEntityIds?: string[]): ContradictionCheckResult;
    /**
     * Check confidence consistency.
     */
    private checkConfidenceConsistency;
    /**
     * Check for conflicting vulnerability status.
     */
    private checkConflictingStatus;
    /**
     * Check data flow validity.
     */
    private checkDataFlowValidity;
    /**
     * Check for duplicate findings.
     */
    private checkDuplicateFindings;
    /**
     * Check if two files have a connection (import/call).
     */
    private hasCrossFileConnection;
    /**
     * Simple title similarity check.
     */
    private isSimilarTitle;
}
