/**
 * Report Builder - Comprehensive report generation pipeline.
 */
import type { VerificationGates } from '../verify/gates.js';
import { type EnhancedFinding, type EnhancedReport } from './finding-schema.js';
export interface ReportBuilderOptions {
    /** Branch name */
    branch?: string;
    /** Commit SHA */
    commitSha?: string;
    /** Whether to generate JSON report */
    generateJson?: boolean;
    /** Whether to generate markdown report */
    generateMarkdown?: boolean;
    /** Whether to generate SARIF report */
    generateSarif?: boolean;
    /** Output directory */
    outputDir: string;
    /** Run ID */
    runId: string;
    /** Scan mode */
    scanMode?: string;
    /** Target name (repository/project) */
    targetName?: string;
    /** Tool version */
    toolVersion?: string;
    /** Verification gates for validation */
    verificationGates?: VerificationGates;
}
/**
 * Builds comprehensive security reports.
 */
export declare class ReportBuilder {
    private filesAnalyzed;
    private filesTotal;
    private readonly findingIds;
    private readonly findings;
    private readonly options;
    private readonly rejectedFindings;
    private startTime;
    constructor(options: ReportBuilderOptions);
    /**
     * Add a finding with optional verification.
     */
    addFinding(finding: EnhancedFinding): {
        added: boolean;
        reason?: string;
    };
    /**
     * Build the complete report.
     */
    build(): EnhancedReport;
    /**
     * Generate all report outputs.
     */
    generate(): Promise<{
        jsonPath?: string;
        markdownPath?: string;
        report: EnhancedReport;
        sarifPath?: string;
    }>;
    /**
     * Get rejected findings for review.
     */
    getRejectedFindings(): typeof this.rejectedFindings;
    /**
     * Set coverage statistics.
     */
    setCoverage(analyzed: number, total?: number): this;
    /**
     * Set analysis start time.
     */
    setStartTime(time: number): this;
    private computeSummary;
    private generateMarkdown;
    private generateReportId;
}
