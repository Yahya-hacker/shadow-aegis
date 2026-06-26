/**
 * Verification Gates - Hard gates for finding validation.
 * No finding may be emitted without passing these gates.
 */
import type { KnowledgeGraph } from '../memory/knowledge-graph.js';
export interface ToolRunRef {
    timestamp: string;
    toolCallId: string;
    toolName: string;
    truncated: boolean;
}
export interface FindingCandidate {
    assumptions?: string[];
    cwe: string;
    entityIds?: string[];
    relatedEntityIds?: string[];
    sinkId?: string;
    sourceId?: string;
    title: string;
    toolRunRefs?: ToolRunRef[];
}
export interface GateResult {
    passed: boolean;
    reason: string;
}
export interface VerificationResult {
    assumptions: string[];
    canEmit: boolean;
    confidence: number;
    confidenceLevel: 'high' | 'insufficient' | 'low' | 'medium';
    failedGates: string[];
    gateResults: Record<string, GateResult>;
    passedGates: string[];
    recommendations: string[];
    warnings: string[];
}
export interface VerificationGatesOptions {
    /** Allow findings with assumptions (default: true with warning) */
    allowAssumptions?: boolean;
    /** Minimum confidence to emit (default: 0.5) */
    minConfidence?: number;
    /** Require code evidence (default: true) */
    requireCodeEvidence?: boolean;
    /** Require data flow verification for injection findings (default: true) */
    requireDataFlow?: boolean;
}
/**
 * Verification gates for finding validation.
 */
export declare class VerificationGates {
    private readonly contradictionChecker;
    private readonly evidenceLinker;
    private readonly graph;
    private readonly options;
    constructor(graph: KnowledgeGraph, options?: VerificationGatesOptions);
    /**
     * Quick check if a finding has minimum required evidence.
     */
    hasMinimumEvidence(candidate: FindingCandidate): boolean;
    /**
     * Run all verification gates on a finding candidate.
     */
    verify(candidate: FindingCandidate): VerificationResult;
    private gateAssumptionsFlagged;
    private gateCodeEvidencePresent;
    private gateDataFlowPresent;
    private gateNoContradictions;
    private gateTruncationFlagged;
    private isInjectionFinding;
}
