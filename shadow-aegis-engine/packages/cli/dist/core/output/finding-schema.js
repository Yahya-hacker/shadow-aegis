/**
 * Enhanced Finding Schema - Production-grade security finding types.
 */
import { z } from 'zod';
import { confidenceSchema, SCHEMA_VERSION, severitySchema } from '../schema/base.js';
// =============================================================================
// Core Schemas
// =============================================================================
// Re-define tool run ref for finding context (different from base schema)
export const findingToolRunRefSchema = z.object({
    timestamp: z.string().datetime(),
    toolName: z.string().min(1),
    toolRunId: z.string().min(1),
    truncated: z.boolean().default(false),
});
// Evidence ref for findings
export const findingEvidenceRefSchema = z.object({
    description: z.string().optional(),
    entityId: z.string().optional(),
    filePath: z.string().optional(),
    lineNumber: z.number().int().positive().optional(),
    type: z.enum(['code', 'tool_run', 'manual', 'data_flow']),
});
export const attackerPersonaSchema = z.enum([
    'unauthenticated_remote',
    'authenticated_user',
    'privileged_user',
    'local_attacker',
    'insider_threat',
    'supply_chain',
    'physical_access',
]);
export const exploitabilitySchema = z.enum([
    'trivial', // Exploit code readily available, no special skills
    'easy', // Common tools/knowledge sufficient
    'moderate', // Some skill/customization required
    'difficult', // Significant expertise needed
    'theoretical', // Only theoretically possible
]);
export const codeLocationSchema = z.object({
    className: z.string().optional(),
    endColumn: z.number().int().nonnegative().optional(),
    endLine: z.number().int().positive().optional(),
    filePath: z.string().min(1),
    functionName: z.string().optional(),
    snippet: z.string().optional(),
    snippetHash: z.string().optional(),
    startColumn: z.number().int().nonnegative().optional(),
    startLine: z.number().int().positive().optional(),
});
export const dataFlowStepSchema = z.object({
    description: z.string(),
    isSanitizer: z.boolean().default(false),
    isSink: z.boolean().default(false),
    isSource: z.boolean().default(false),
    location: codeLocationSchema,
    taintLabel: z.string().optional(),
});
export const remediationSchema = z.object({
    breakingChange: z.boolean().default(false),
    codeExample: z.string().optional(),
    effort: z.enum(['low', 'medium', 'high']).optional(),
    references: z.array(z.string().url()).optional(),
    steps: z.array(z.string()).optional(),
    summary: z.string().min(1),
});
export const assumptionSchema = z.object({
    impact: z.enum(['critical', 'major', 'minor']),
    justification: z.string().optional(),
    statement: z.string().min(1),
});
// =============================================================================
// Enhanced Finding Schema
// =============================================================================
export const enhancedFindingSchema = z.object({
    /** Additional CWE identifiers */
    additionalCwes: z.array(z.string().regex(/^CWE-\d+$/)).optional(),
    /** Explicit assumptions made */
    assumptions: z.array(assumptionSchema).optional(),
    // === Context ===
    /** Attacker personas who could exploit this */
    attackerPersonas: z.array(attackerPersonaSchema).min(1),
    /** Business impact description */
    businessImpact: z.string().optional(),
    // === Confidence & Assumptions ===
    /** Overall confidence score (0-1) */
    confidence: confidenceSchema,
    /** CVSS v3.1 score (0-10) */
    cvssV31Score: z.number().min(0).max(10),
    /** CVSS v3.1 vector string */
    cvssV31Vector: z.string().regex(/^CVSS:3\.1\//),
    /** Optional CVSS v4.0 score */
    cvssV40Score: z.number().min(0).max(10).nullable().optional(),
    /** Optional CVSS v4.0 vector string */
    cvssV40Vector: z.string().regex(/^CVSS:4\.0\//).nullable().optional(),
    /** Primary CWE identifier */
    cwe: z.string().regex(/^CWE-\d+$/),
    /** Data flow path (for injection/flow-based findings) */
    dataFlowPath: z.array(dataFlowStepSchema).optional(),
    /** Detailed description */
    description: z.string().optional(),
    /** Evidence references */
    evidenceRefs: z.array(findingEvidenceRefSchema).optional(),
    /** Exploitability assessment */
    exploitability: exploitabilitySchema,
    /** Exploit path summary */
    exploitPathSummary: z.string().optional(),
    /** Whether this is a false positive candidate */
    falsePositiveRisk: z.enum(['low', 'medium', 'high']).optional(),
    // === Metadata ===
    /** When this finding was first identified */
    firstSeenAt: z.string().datetime().optional(),
    // === Location ===
    /** Primary code locations */
    locations: z.array(codeLocationSchema).min(1),
    /** OWASP category if applicable */
    owaspCategory: z.string().optional(),
    /** Related finding IDs (duplicates, variants) */
    relatedFindings: z.array(z.string()).optional(),
    // === Remediation ===
    /** Remediation guidance */
    remediation: remediationSchema,
    // === Analysis ===
    /** Root cause explanation */
    rootCause: z.string().min(1),
    schemaVersion: z.string().default(SCHEMA_VERSION),
    // === Classification ===
    /** Severity label */
    severityLabel: severitySchema,
    /** Tags for categorization */
    tags: z.array(z.string()).optional(),
    /** Human-readable title */
    title: z.string().min(1),
    /** Tool run references that contributed to this finding */
    toolRunRefs: z.array(findingToolRunRefSchema).optional(),
    /** Whether evidence was truncated */
    truncated: z.boolean().default(false),
    // === Identification ===
    /** Deterministic vulnerability ID (computed from content hash) */
    vulnId: z.string().min(1),
});
// =============================================================================
// Report Schema
// =============================================================================
export const reportMetadataSchema = z.object({
    /** Target branch if applicable */
    branch: z.string().optional(),
    /** Target commit SHA if applicable */
    commitSha: z.string().optional(),
    /** Coverage statistics */
    coverage: z.object({
        filesAnalyzed: z.number().int().nonnegative(),
        filesTotal: z.number().int().nonnegative().optional(),
        linesAnalyzed: z.number().int().nonnegative().optional(),
        percentComplete: z.number().min(0).max(100).optional(),
    }).optional(),
    /** Total duration in milliseconds */
    durationMs: z.number().int().nonnegative().optional(),
    /** Report generation timestamp */
    generatedAt: z.string().datetime(),
    /** Unique report ID */
    reportId: z.string().min(1),
    /** Run ID that produced this report */
    runId: z.string().min(1),
    /** Scan mode used */
    scanMode: z.string().optional(),
    schemaVersion: z.string().default(SCHEMA_VERSION),
    /** Target repository/project name */
    targetName: z.string().optional(),
    /** Shadow Auditor version */
    toolVersion: z.string(),
});
export const reportSummarySchema = z.object({
    byConfidence: z.object({
        high: z.number().int().nonnegative(),
        low: z.number().int().nonnegative(),
        medium: z.number().int().nonnegative(),
    }),
    bySeverity: z.object({
        critical: z.number().int().nonnegative(),
        high: z.number().int().nonnegative(),
        info: z.number().int().nonnegative(),
        low: z.number().int().nonnegative(),
        medium: z.number().int().nonnegative(),
    }),
    riskScore: z.number().min(0).max(100).optional(),
    topCwes: z.array(z.object({
        count: z.number().int().positive(),
        cwe: z.string(),
    })).optional(),
    totalFindings: z.number().int().nonnegative(),
});
export const enhancedReportSchema = z.object({
    findings: z.array(enhancedFindingSchema),
    metadata: reportMetadataSchema,
    schemaVersion: z.string().default(SCHEMA_VERSION),
    summary: reportSummarySchema,
});
// =============================================================================
// Validation Helpers
// =============================================================================
/**
 * Validate a finding and return detailed errors.
 */
export function validateFinding(finding) {
    const result = enhancedFindingSchema.safeParse(finding);
    if (result.success) {
        return { errors: [], valid: true };
    }
    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
    });
    return { errors, valid: false };
}
/**
 * Validate a complete report.
 */
export function validateReport(report) {
    const result = enhancedReportSchema.safeParse(report);
    if (result.success) {
        return { errors: [], valid: true };
    }
    const errors = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        return `${path}: ${issue.message}`;
    });
    return { errors, valid: false };
}
// =============================================================================
// Finding Builder
// =============================================================================
/**
 * Builder for creating enhanced findings.
 */
export class FindingBuilder {
    finding = {};
    constructor(vulnId, title) {
        this.finding.vulnId = vulnId;
        this.finding.title = title;
        this.finding.schemaVersion = SCHEMA_VERSION;
    }
    assumption(stmt, impact, justification) {
        if (!this.finding.assumptions) {
            this.finding.assumptions = [];
        }
        this.finding.assumptions.push({ impact, justification, statement: stmt });
        return this;
    }
    attackers(...personas) {
        this.finding.attackerPersonas = personas;
        return this;
    }
    build() {
        const result = enhancedFindingSchema.parse(this.finding);
        return result;
    }
    confidence(score) {
        this.finding.confidence = score;
        return this;
    }
    cvss40(score, vector) {
        this.finding.cvssV40Score = score;
        this.finding.cvssV40Vector = vector;
        return this;
    }
    cwe(primary, additional) {
        this.finding.cwe = primary;
        if (additional) {
            this.finding.additionalCwes = additional;
        }
        return this;
    }
    dataFlow(steps) {
        this.finding.dataFlowPath = steps;
        return this;
    }
    description(desc) {
        this.finding.description = desc;
        return this;
    }
    evidence(refs) {
        this.finding.evidenceRefs = refs;
        return this;
    }
    exploitability(level) {
        this.finding.exploitability = level;
        return this;
    }
    exploitPath(summary) {
        this.finding.exploitPathSummary = summary;
        return this;
    }
    location(loc) {
        if (!this.finding.locations) {
            this.finding.locations = [];
        }
        this.finding.locations.push(loc);
        return this;
    }
    remediation(rem) {
        this.finding.remediation = rem;
        return this;
    }
    rootCause(cause) {
        this.finding.rootCause = cause;
        return this;
    }
    severity(label, cvss31Score, cvss31Vector) {
        this.finding.severityLabel = label;
        this.finding.cvssV31Score = cvss31Score;
        this.finding.cvssV31Vector = cvss31Vector;
        return this;
    }
    tags(...tags) {
        this.finding.tags = tags;
        return this;
    }
    toolRuns(refs) {
        this.finding.toolRunRefs = refs;
        return this;
    }
    truncated(value = true) {
        this.finding.truncated = value;
        return this;
    }
}
