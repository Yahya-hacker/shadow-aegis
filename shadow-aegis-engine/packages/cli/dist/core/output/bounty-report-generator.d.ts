/**
 * Bounty Report Generator - Deterministic JSON-to-Markdown Templating Engine.
 *
 * THE LLM IS NEVER ALLOWED TO WRITE THE FINAL REPORT PROSE.
 *
 * It produces structured JSON data only. This module renders that data
 * into fixed Markdown templates, injecting raw sandbox execution logs
 * verbatim as cryptographic proof. The LLM cannot exaggerate, hallucinate,
 * or embellish the proof-of-concept section.
 */
import { type OastCallback, type SandboxExecResult } from '../dast/dast-schema.js';
export interface BountyFindingData {
    cweId: string;
    impactDescription: string;
    remediationSummary?: string;
    reproductionSteps: string[];
    severityLabel: string;
    summary: string;
    title: string;
    vulnId: string;
}
export interface BountyReportOptions {
    findings: BountyFindingData[];
    oastCallbacks?: OastCallback[];
    platform?: 'bugcrowd' | 'generic' | 'hackerone';
    sandboxLogs?: SandboxExecResult[];
    targetName: string;
}
/**
 * Generate a deterministic Markdown report for a single finding.
 *
 * The "Proof of Concept" section is populated EXCLUSIVELY from raw
 * SandboxExecResult logs. The LLM has no access to modify this section.
 */
export declare function generatePerFindingReport(finding: BountyFindingData, sandboxLogs: SandboxExecResult[], oastCallbacks: OastCallback[]): string;
/**
 * Generate a complete bounty report from structured finding data.
 *
 * This is the main entry point for the deterministic report generator.
 * It does NOT call any LLM — it templates pure data into Markdown.
 */
export declare function generateBountyReport(options: BountyReportOptions): string;
/**
 * Generate an index file linking all per-finding reports.
 */
export declare function generateFindingsIndex(findings: BountyFindingData[], targetName: string): string;
