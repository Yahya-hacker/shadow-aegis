/**
 * Enhanced Finding Schema - Production-grade security finding types.
 */
import { z } from 'zod';
export declare const findingToolRunRefSchema: z.ZodObject<{
    timestamp: z.ZodString;
    toolName: z.ZodString;
    toolRunId: z.ZodString;
    truncated: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    toolName: string;
    truncated: boolean;
    timestamp: string;
    toolRunId: string;
}, {
    toolName: string;
    timestamp: string;
    toolRunId: string;
    truncated?: boolean | undefined;
}>;
export type FindingToolRunRef = z.infer<typeof findingToolRunRefSchema>;
export declare const findingEvidenceRefSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    entityId: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    lineNumber: z.ZodOptional<z.ZodNumber>;
    type: z.ZodEnum<["code", "tool_run", "manual", "data_flow"]>;
}, "strip", z.ZodTypeAny, {
    type: "code" | "tool_run" | "manual" | "data_flow";
    filePath?: string | undefined;
    description?: string | undefined;
    lineNumber?: number | undefined;
    entityId?: string | undefined;
}, {
    type: "code" | "tool_run" | "manual" | "data_flow";
    filePath?: string | undefined;
    description?: string | undefined;
    lineNumber?: number | undefined;
    entityId?: string | undefined;
}>;
export type FindingEvidenceRef = z.infer<typeof findingEvidenceRefSchema>;
export declare const attackerPersonaSchema: z.ZodEnum<["unauthenticated_remote", "authenticated_user", "privileged_user", "local_attacker", "insider_threat", "supply_chain", "physical_access"]>;
export type AttackerPersona = z.infer<typeof attackerPersonaSchema>;
export declare const exploitabilitySchema: z.ZodEnum<["trivial", "easy", "moderate", "difficult", "theoretical"]>;
export type Exploitability = z.infer<typeof exploitabilitySchema>;
export declare const codeLocationSchema: z.ZodObject<{
    className: z.ZodOptional<z.ZodString>;
    endColumn: z.ZodOptional<z.ZodNumber>;
    endLine: z.ZodOptional<z.ZodNumber>;
    filePath: z.ZodString;
    functionName: z.ZodOptional<z.ZodString>;
    snippet: z.ZodOptional<z.ZodString>;
    snippetHash: z.ZodOptional<z.ZodString>;
    startColumn: z.ZodOptional<z.ZodNumber>;
    startLine: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    endColumn?: number | undefined;
    endLine?: number | undefined;
    startColumn?: number | undefined;
    startLine?: number | undefined;
    className?: string | undefined;
    functionName?: string | undefined;
    snippet?: string | undefined;
    snippetHash?: string | undefined;
}, {
    filePath: string;
    endColumn?: number | undefined;
    endLine?: number | undefined;
    startColumn?: number | undefined;
    startLine?: number | undefined;
    className?: string | undefined;
    functionName?: string | undefined;
    snippet?: string | undefined;
    snippetHash?: string | undefined;
}>;
export type CodeLocation = z.infer<typeof codeLocationSchema>;
export declare const dataFlowStepSchema: z.ZodObject<{
    description: z.ZodString;
    isSanitizer: z.ZodDefault<z.ZodBoolean>;
    isSink: z.ZodDefault<z.ZodBoolean>;
    isSource: z.ZodDefault<z.ZodBoolean>;
    location: z.ZodObject<{
        className: z.ZodOptional<z.ZodString>;
        endColumn: z.ZodOptional<z.ZodNumber>;
        endLine: z.ZodOptional<z.ZodNumber>;
        filePath: z.ZodString;
        functionName: z.ZodOptional<z.ZodString>;
        snippet: z.ZodOptional<z.ZodString>;
        snippetHash: z.ZodOptional<z.ZodString>;
        startColumn: z.ZodOptional<z.ZodNumber>;
        startLine: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    }, {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    }>;
    taintLabel: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    location: {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    };
    description: string;
    isSanitizer: boolean;
    isSink: boolean;
    isSource: boolean;
    taintLabel?: string | undefined;
}, {
    location: {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    };
    description: string;
    isSanitizer?: boolean | undefined;
    isSink?: boolean | undefined;
    isSource?: boolean | undefined;
    taintLabel?: string | undefined;
}>;
export type DataFlowStep = z.infer<typeof dataFlowStepSchema>;
export declare const remediationSchema: z.ZodObject<{
    breakingChange: z.ZodDefault<z.ZodBoolean>;
    codeExample: z.ZodOptional<z.ZodString>;
    effort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    breakingChange: boolean;
    summary: string;
    steps?: string[] | undefined;
    codeExample?: string | undefined;
    effort?: "high" | "low" | "medium" | undefined;
    references?: string[] | undefined;
}, {
    summary: string;
    steps?: string[] | undefined;
    breakingChange?: boolean | undefined;
    codeExample?: string | undefined;
    effort?: "high" | "low" | "medium" | undefined;
    references?: string[] | undefined;
}>;
export type Remediation = z.infer<typeof remediationSchema>;
export declare const assumptionSchema: z.ZodObject<{
    impact: z.ZodEnum<["critical", "major", "minor"]>;
    justification: z.ZodOptional<z.ZodString>;
    statement: z.ZodString;
}, "strip", z.ZodTypeAny, {
    impact: "critical" | "major" | "minor";
    statement: string;
    justification?: string | undefined;
}, {
    impact: "critical" | "major" | "minor";
    statement: string;
    justification?: string | undefined;
}>;
export type Assumption = z.infer<typeof assumptionSchema>;
export declare const enhancedFindingSchema: z.ZodObject<{
    /** Additional CWE identifiers */
    additionalCwes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Explicit assumptions made */
    assumptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        impact: z.ZodEnum<["critical", "major", "minor"]>;
        justification: z.ZodOptional<z.ZodString>;
        statement: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        impact: "critical" | "major" | "minor";
        statement: string;
        justification?: string | undefined;
    }, {
        impact: "critical" | "major" | "minor";
        statement: string;
        justification?: string | undefined;
    }>, "many">>;
    /** Attacker personas who could exploit this */
    attackerPersonas: z.ZodArray<z.ZodEnum<["unauthenticated_remote", "authenticated_user", "privileged_user", "local_attacker", "insider_threat", "supply_chain", "physical_access"]>, "many">;
    /** Business impact description */
    businessImpact: z.ZodOptional<z.ZodString>;
    /** Overall confidence score (0-1) */
    confidence: z.ZodNumber;
    /** CVSS v3.1 score (0-10) */
    cvssV31Score: z.ZodNumber;
    /** CVSS v3.1 vector string */
    cvssV31Vector: z.ZodString;
    /** Optional CVSS v4.0 score */
    cvssV40Score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /** Optional CVSS v4.0 vector string */
    cvssV40Vector: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Primary CWE identifier */
    cwe: z.ZodString;
    /** Data flow path (for injection/flow-based findings) */
    dataFlowPath: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        isSanitizer: z.ZodDefault<z.ZodBoolean>;
        isSink: z.ZodDefault<z.ZodBoolean>;
        isSource: z.ZodDefault<z.ZodBoolean>;
        location: z.ZodObject<{
            className: z.ZodOptional<z.ZodString>;
            endColumn: z.ZodOptional<z.ZodNumber>;
            endLine: z.ZodOptional<z.ZodNumber>;
            filePath: z.ZodString;
            functionName: z.ZodOptional<z.ZodString>;
            snippet: z.ZodOptional<z.ZodString>;
            snippetHash: z.ZodOptional<z.ZodString>;
            startColumn: z.ZodOptional<z.ZodNumber>;
            startLine: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }, {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }>;
        taintLabel: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        };
        description: string;
        isSanitizer: boolean;
        isSink: boolean;
        isSource: boolean;
        taintLabel?: string | undefined;
    }, {
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        };
        description: string;
        isSanitizer?: boolean | undefined;
        isSink?: boolean | undefined;
        isSource?: boolean | undefined;
        taintLabel?: string | undefined;
    }>, "many">>;
    /** Detailed description */
    description: z.ZodOptional<z.ZodString>;
    /** Evidence references */
    evidenceRefs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        description: z.ZodOptional<z.ZodString>;
        entityId: z.ZodOptional<z.ZodString>;
        filePath: z.ZodOptional<z.ZodString>;
        lineNumber: z.ZodOptional<z.ZodNumber>;
        type: z.ZodEnum<["code", "tool_run", "manual", "data_flow"]>;
    }, "strip", z.ZodTypeAny, {
        type: "code" | "tool_run" | "manual" | "data_flow";
        filePath?: string | undefined;
        description?: string | undefined;
        lineNumber?: number | undefined;
        entityId?: string | undefined;
    }, {
        type: "code" | "tool_run" | "manual" | "data_flow";
        filePath?: string | undefined;
        description?: string | undefined;
        lineNumber?: number | undefined;
        entityId?: string | undefined;
    }>, "many">>;
    /** Exploitability assessment */
    exploitability: z.ZodEnum<["trivial", "easy", "moderate", "difficult", "theoretical"]>;
    /** Exploit path summary */
    exploitPathSummary: z.ZodOptional<z.ZodString>;
    /** Whether this is a false positive candidate */
    falsePositiveRisk: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
    /** When this finding was first identified */
    firstSeenAt: z.ZodOptional<z.ZodString>;
    /** Primary code locations */
    locations: z.ZodArray<z.ZodObject<{
        className: z.ZodOptional<z.ZodString>;
        endColumn: z.ZodOptional<z.ZodNumber>;
        endLine: z.ZodOptional<z.ZodNumber>;
        filePath: z.ZodString;
        functionName: z.ZodOptional<z.ZodString>;
        snippet: z.ZodOptional<z.ZodString>;
        snippetHash: z.ZodOptional<z.ZodString>;
        startColumn: z.ZodOptional<z.ZodNumber>;
        startLine: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    }, {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    }>, "many">;
    /** OWASP category if applicable */
    owaspCategory: z.ZodOptional<z.ZodString>;
    /** Related finding IDs (duplicates, variants) */
    relatedFindings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Remediation guidance */
    remediation: z.ZodObject<{
        breakingChange: z.ZodDefault<z.ZodBoolean>;
        codeExample: z.ZodOptional<z.ZodString>;
        effort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        summary: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        breakingChange: boolean;
        summary: string;
        steps?: string[] | undefined;
        codeExample?: string | undefined;
        effort?: "high" | "low" | "medium" | undefined;
        references?: string[] | undefined;
    }, {
        summary: string;
        steps?: string[] | undefined;
        breakingChange?: boolean | undefined;
        codeExample?: string | undefined;
        effort?: "high" | "low" | "medium" | undefined;
        references?: string[] | undefined;
    }>;
    /** Root cause explanation */
    rootCause: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
    /** Severity label */
    severityLabel: z.ZodEnum<["Critical", "High", "Medium", "Low", "Info"]>;
    /** Tags for categorization */
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Human-readable title */
    title: z.ZodString;
    /** Tool run references that contributed to this finding */
    toolRunRefs: z.ZodOptional<z.ZodArray<z.ZodObject<{
        timestamp: z.ZodString;
        toolName: z.ZodString;
        toolRunId: z.ZodString;
        truncated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        toolName: string;
        truncated: boolean;
        timestamp: string;
        toolRunId: string;
    }, {
        toolName: string;
        timestamp: string;
        toolRunId: string;
        truncated?: boolean | undefined;
    }>, "many">>;
    /** Whether evidence was truncated */
    truncated: z.ZodDefault<z.ZodBoolean>;
    /** Deterministic vulnerability ID (computed from content hash) */
    vulnId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    remediation: {
        breakingChange: boolean;
        summary: string;
        steps?: string[] | undefined;
        codeExample?: string | undefined;
        effort?: "high" | "low" | "medium" | undefined;
        references?: string[] | undefined;
    };
    truncated: boolean;
    schemaVersion: string;
    confidence: number;
    cvssV31Score: number;
    cvssV31Vector: string;
    cwe: string;
    title: string;
    attackerPersonas: ("unauthenticated_remote" | "authenticated_user" | "privileged_user" | "local_attacker" | "insider_threat" | "supply_chain" | "physical_access")[];
    exploitability: "trivial" | "easy" | "moderate" | "difficult" | "theoretical";
    locations: {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    }[];
    rootCause: string;
    severityLabel: "Critical" | "High" | "Medium" | "Low" | "Info";
    vulnId: string;
    description?: string | undefined;
    additionalCwes?: string[] | undefined;
    assumptions?: {
        impact: "critical" | "major" | "minor";
        statement: string;
        justification?: string | undefined;
    }[] | undefined;
    businessImpact?: string | undefined;
    cvssV40Score?: number | null | undefined;
    cvssV40Vector?: string | null | undefined;
    dataFlowPath?: {
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        };
        description: string;
        isSanitizer: boolean;
        isSink: boolean;
        isSource: boolean;
        taintLabel?: string | undefined;
    }[] | undefined;
    evidenceRefs?: {
        type: "code" | "tool_run" | "manual" | "data_flow";
        filePath?: string | undefined;
        description?: string | undefined;
        lineNumber?: number | undefined;
        entityId?: string | undefined;
    }[] | undefined;
    exploitPathSummary?: string | undefined;
    falsePositiveRisk?: "high" | "low" | "medium" | undefined;
    firstSeenAt?: string | undefined;
    owaspCategory?: string | undefined;
    relatedFindings?: string[] | undefined;
    tags?: string[] | undefined;
    toolRunRefs?: {
        toolName: string;
        truncated: boolean;
        timestamp: string;
        toolRunId: string;
    }[] | undefined;
}, {
    remediation: {
        summary: string;
        steps?: string[] | undefined;
        breakingChange?: boolean | undefined;
        codeExample?: string | undefined;
        effort?: "high" | "low" | "medium" | undefined;
        references?: string[] | undefined;
    };
    confidence: number;
    cvssV31Score: number;
    cvssV31Vector: string;
    cwe: string;
    title: string;
    attackerPersonas: ("unauthenticated_remote" | "authenticated_user" | "privileged_user" | "local_attacker" | "insider_threat" | "supply_chain" | "physical_access")[];
    exploitability: "trivial" | "easy" | "moderate" | "difficult" | "theoretical";
    locations: {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
        className?: string | undefined;
        functionName?: string | undefined;
        snippet?: string | undefined;
        snippetHash?: string | undefined;
    }[];
    rootCause: string;
    severityLabel: "Critical" | "High" | "Medium" | "Low" | "Info";
    vulnId: string;
    truncated?: boolean | undefined;
    description?: string | undefined;
    schemaVersion?: string | undefined;
    additionalCwes?: string[] | undefined;
    assumptions?: {
        impact: "critical" | "major" | "minor";
        statement: string;
        justification?: string | undefined;
    }[] | undefined;
    businessImpact?: string | undefined;
    cvssV40Score?: number | null | undefined;
    cvssV40Vector?: string | null | undefined;
    dataFlowPath?: {
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        };
        description: string;
        isSanitizer?: boolean | undefined;
        isSink?: boolean | undefined;
        isSource?: boolean | undefined;
        taintLabel?: string | undefined;
    }[] | undefined;
    evidenceRefs?: {
        type: "code" | "tool_run" | "manual" | "data_flow";
        filePath?: string | undefined;
        description?: string | undefined;
        lineNumber?: number | undefined;
        entityId?: string | undefined;
    }[] | undefined;
    exploitPathSummary?: string | undefined;
    falsePositiveRisk?: "high" | "low" | "medium" | undefined;
    firstSeenAt?: string | undefined;
    owaspCategory?: string | undefined;
    relatedFindings?: string[] | undefined;
    tags?: string[] | undefined;
    toolRunRefs?: {
        toolName: string;
        timestamp: string;
        toolRunId: string;
        truncated?: boolean | undefined;
    }[] | undefined;
}>;
export type EnhancedFinding = z.infer<typeof enhancedFindingSchema>;
export declare const reportMetadataSchema: z.ZodObject<{
    /** Target branch if applicable */
    branch: z.ZodOptional<z.ZodString>;
    /** Target commit SHA if applicable */
    commitSha: z.ZodOptional<z.ZodString>;
    /** Coverage statistics */
    coverage: z.ZodOptional<z.ZodObject<{
        filesAnalyzed: z.ZodNumber;
        filesTotal: z.ZodOptional<z.ZodNumber>;
        linesAnalyzed: z.ZodOptional<z.ZodNumber>;
        percentComplete: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        filesAnalyzed: number;
        filesTotal?: number | undefined;
        linesAnalyzed?: number | undefined;
        percentComplete?: number | undefined;
    }, {
        filesAnalyzed: number;
        filesTotal?: number | undefined;
        linesAnalyzed?: number | undefined;
        percentComplete?: number | undefined;
    }>>;
    /** Total duration in milliseconds */
    durationMs: z.ZodOptional<z.ZodNumber>;
    /** Report generation timestamp */
    generatedAt: z.ZodString;
    /** Unique report ID */
    reportId: z.ZodString;
    /** Run ID that produced this report */
    runId: z.ZodString;
    /** Scan mode used */
    scanMode: z.ZodOptional<z.ZodString>;
    schemaVersion: z.ZodDefault<z.ZodString>;
    /** Target repository/project name */
    targetName: z.ZodOptional<z.ZodString>;
    /** Shadow Auditor version */
    toolVersion: z.ZodString;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    runId: string;
    generatedAt: string;
    reportId: string;
    toolVersion: string;
    durationMs?: number | undefined;
    coverage?: {
        filesAnalyzed: number;
        filesTotal?: number | undefined;
        linesAnalyzed?: number | undefined;
        percentComplete?: number | undefined;
    } | undefined;
    branch?: string | undefined;
    commitSha?: string | undefined;
    scanMode?: string | undefined;
    targetName?: string | undefined;
}, {
    runId: string;
    generatedAt: string;
    reportId: string;
    toolVersion: string;
    schemaVersion?: string | undefined;
    durationMs?: number | undefined;
    coverage?: {
        filesAnalyzed: number;
        filesTotal?: number | undefined;
        linesAnalyzed?: number | undefined;
        percentComplete?: number | undefined;
    } | undefined;
    branch?: string | undefined;
    commitSha?: string | undefined;
    scanMode?: string | undefined;
    targetName?: string | undefined;
}>;
export type ReportMetadata = z.infer<typeof reportMetadataSchema>;
export declare const reportSummarySchema: z.ZodObject<{
    byConfidence: z.ZodObject<{
        high: z.ZodNumber;
        low: z.ZodNumber;
        medium: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        high: number;
        low: number;
        medium: number;
    }, {
        high: number;
        low: number;
        medium: number;
    }>;
    bySeverity: z.ZodObject<{
        critical: z.ZodNumber;
        high: z.ZodNumber;
        info: z.ZodNumber;
        low: z.ZodNumber;
        medium: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        critical: number;
        high: number;
        low: number;
        medium: number;
        info: number;
    }, {
        critical: number;
        high: number;
        low: number;
        medium: number;
        info: number;
    }>;
    riskScore: z.ZodOptional<z.ZodNumber>;
    topCwes: z.ZodOptional<z.ZodArray<z.ZodObject<{
        count: z.ZodNumber;
        cwe: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        cwe: string;
        count: number;
    }, {
        cwe: string;
        count: number;
    }>, "many">>;
    totalFindings: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    byConfidence: {
        high: number;
        low: number;
        medium: number;
    };
    bySeverity: {
        critical: number;
        high: number;
        low: number;
        medium: number;
        info: number;
    };
    totalFindings: number;
    riskScore?: number | undefined;
    topCwes?: {
        cwe: string;
        count: number;
    }[] | undefined;
}, {
    byConfidence: {
        high: number;
        low: number;
        medium: number;
    };
    bySeverity: {
        critical: number;
        high: number;
        low: number;
        medium: number;
        info: number;
    };
    totalFindings: number;
    riskScore?: number | undefined;
    topCwes?: {
        cwe: string;
        count: number;
    }[] | undefined;
}>;
export type ReportSummary = z.infer<typeof reportSummarySchema>;
export declare const enhancedReportSchema: z.ZodObject<{
    findings: z.ZodArray<z.ZodObject<{
        /** Additional CWE identifiers */
        additionalCwes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        /** Explicit assumptions made */
        assumptions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            impact: z.ZodEnum<["critical", "major", "minor"]>;
            justification: z.ZodOptional<z.ZodString>;
            statement: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            impact: "critical" | "major" | "minor";
            statement: string;
            justification?: string | undefined;
        }, {
            impact: "critical" | "major" | "minor";
            statement: string;
            justification?: string | undefined;
        }>, "many">>;
        /** Attacker personas who could exploit this */
        attackerPersonas: z.ZodArray<z.ZodEnum<["unauthenticated_remote", "authenticated_user", "privileged_user", "local_attacker", "insider_threat", "supply_chain", "physical_access"]>, "many">;
        /** Business impact description */
        businessImpact: z.ZodOptional<z.ZodString>;
        /** Overall confidence score (0-1) */
        confidence: z.ZodNumber;
        /** CVSS v3.1 score (0-10) */
        cvssV31Score: z.ZodNumber;
        /** CVSS v3.1 vector string */
        cvssV31Vector: z.ZodString;
        /** Optional CVSS v4.0 score */
        cvssV40Score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        /** Optional CVSS v4.0 vector string */
        cvssV40Vector: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Primary CWE identifier */
        cwe: z.ZodString;
        /** Data flow path (for injection/flow-based findings) */
        dataFlowPath: z.ZodOptional<z.ZodArray<z.ZodObject<{
            description: z.ZodString;
            isSanitizer: z.ZodDefault<z.ZodBoolean>;
            isSink: z.ZodDefault<z.ZodBoolean>;
            isSource: z.ZodDefault<z.ZodBoolean>;
            location: z.ZodObject<{
                className: z.ZodOptional<z.ZodString>;
                endColumn: z.ZodOptional<z.ZodNumber>;
                endLine: z.ZodOptional<z.ZodNumber>;
                filePath: z.ZodString;
                functionName: z.ZodOptional<z.ZodString>;
                snippet: z.ZodOptional<z.ZodString>;
                snippetHash: z.ZodOptional<z.ZodString>;
                startColumn: z.ZodOptional<z.ZodNumber>;
                startLine: z.ZodOptional<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            }, {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            }>;
            taintLabel: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            location: {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            };
            description: string;
            isSanitizer: boolean;
            isSink: boolean;
            isSource: boolean;
            taintLabel?: string | undefined;
        }, {
            location: {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            };
            description: string;
            isSanitizer?: boolean | undefined;
            isSink?: boolean | undefined;
            isSource?: boolean | undefined;
            taintLabel?: string | undefined;
        }>, "many">>;
        /** Detailed description */
        description: z.ZodOptional<z.ZodString>;
        /** Evidence references */
        evidenceRefs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            description: z.ZodOptional<z.ZodString>;
            entityId: z.ZodOptional<z.ZodString>;
            filePath: z.ZodOptional<z.ZodString>;
            lineNumber: z.ZodOptional<z.ZodNumber>;
            type: z.ZodEnum<["code", "tool_run", "manual", "data_flow"]>;
        }, "strip", z.ZodTypeAny, {
            type: "code" | "tool_run" | "manual" | "data_flow";
            filePath?: string | undefined;
            description?: string | undefined;
            lineNumber?: number | undefined;
            entityId?: string | undefined;
        }, {
            type: "code" | "tool_run" | "manual" | "data_flow";
            filePath?: string | undefined;
            description?: string | undefined;
            lineNumber?: number | undefined;
            entityId?: string | undefined;
        }>, "many">>;
        /** Exploitability assessment */
        exploitability: z.ZodEnum<["trivial", "easy", "moderate", "difficult", "theoretical"]>;
        /** Exploit path summary */
        exploitPathSummary: z.ZodOptional<z.ZodString>;
        /** Whether this is a false positive candidate */
        falsePositiveRisk: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        /** When this finding was first identified */
        firstSeenAt: z.ZodOptional<z.ZodString>;
        /** Primary code locations */
        locations: z.ZodArray<z.ZodObject<{
            className: z.ZodOptional<z.ZodString>;
            endColumn: z.ZodOptional<z.ZodNumber>;
            endLine: z.ZodOptional<z.ZodNumber>;
            filePath: z.ZodString;
            functionName: z.ZodOptional<z.ZodString>;
            snippet: z.ZodOptional<z.ZodString>;
            snippetHash: z.ZodOptional<z.ZodString>;
            startColumn: z.ZodOptional<z.ZodNumber>;
            startLine: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }, {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }>, "many">;
        /** OWASP category if applicable */
        owaspCategory: z.ZodOptional<z.ZodString>;
        /** Related finding IDs (duplicates, variants) */
        relatedFindings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        /** Remediation guidance */
        remediation: z.ZodObject<{
            breakingChange: z.ZodDefault<z.ZodBoolean>;
            codeExample: z.ZodOptional<z.ZodString>;
            effort: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
            references: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            steps: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            summary: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            breakingChange: boolean;
            summary: string;
            steps?: string[] | undefined;
            codeExample?: string | undefined;
            effort?: "high" | "low" | "medium" | undefined;
            references?: string[] | undefined;
        }, {
            summary: string;
            steps?: string[] | undefined;
            breakingChange?: boolean | undefined;
            codeExample?: string | undefined;
            effort?: "high" | "low" | "medium" | undefined;
            references?: string[] | undefined;
        }>;
        /** Root cause explanation */
        rootCause: z.ZodString;
        schemaVersion: z.ZodDefault<z.ZodString>;
        /** Severity label */
        severityLabel: z.ZodEnum<["Critical", "High", "Medium", "Low", "Info"]>;
        /** Tags for categorization */
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        /** Human-readable title */
        title: z.ZodString;
        /** Tool run references that contributed to this finding */
        toolRunRefs: z.ZodOptional<z.ZodArray<z.ZodObject<{
            timestamp: z.ZodString;
            toolName: z.ZodString;
            toolRunId: z.ZodString;
            truncated: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            toolName: string;
            truncated: boolean;
            timestamp: string;
            toolRunId: string;
        }, {
            toolName: string;
            timestamp: string;
            toolRunId: string;
            truncated?: boolean | undefined;
        }>, "many">>;
        /** Whether evidence was truncated */
        truncated: z.ZodDefault<z.ZodBoolean>;
        /** Deterministic vulnerability ID (computed from content hash) */
        vulnId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        remediation: {
            breakingChange: boolean;
            summary: string;
            steps?: string[] | undefined;
            codeExample?: string | undefined;
            effort?: "high" | "low" | "medium" | undefined;
            references?: string[] | undefined;
        };
        truncated: boolean;
        schemaVersion: string;
        confidence: number;
        cvssV31Score: number;
        cvssV31Vector: string;
        cwe: string;
        title: string;
        attackerPersonas: ("unauthenticated_remote" | "authenticated_user" | "privileged_user" | "local_attacker" | "insider_threat" | "supply_chain" | "physical_access")[];
        exploitability: "trivial" | "easy" | "moderate" | "difficult" | "theoretical";
        locations: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }[];
        rootCause: string;
        severityLabel: "Critical" | "High" | "Medium" | "Low" | "Info";
        vulnId: string;
        description?: string | undefined;
        additionalCwes?: string[] | undefined;
        assumptions?: {
            impact: "critical" | "major" | "minor";
            statement: string;
            justification?: string | undefined;
        }[] | undefined;
        businessImpact?: string | undefined;
        cvssV40Score?: number | null | undefined;
        cvssV40Vector?: string | null | undefined;
        dataFlowPath?: {
            location: {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            };
            description: string;
            isSanitizer: boolean;
            isSink: boolean;
            isSource: boolean;
            taintLabel?: string | undefined;
        }[] | undefined;
        evidenceRefs?: {
            type: "code" | "tool_run" | "manual" | "data_flow";
            filePath?: string | undefined;
            description?: string | undefined;
            lineNumber?: number | undefined;
            entityId?: string | undefined;
        }[] | undefined;
        exploitPathSummary?: string | undefined;
        falsePositiveRisk?: "high" | "low" | "medium" | undefined;
        firstSeenAt?: string | undefined;
        owaspCategory?: string | undefined;
        relatedFindings?: string[] | undefined;
        tags?: string[] | undefined;
        toolRunRefs?: {
            toolName: string;
            truncated: boolean;
            timestamp: string;
            toolRunId: string;
        }[] | undefined;
    }, {
        remediation: {
            summary: string;
            steps?: string[] | undefined;
            breakingChange?: boolean | undefined;
            codeExample?: string | undefined;
            effort?: "high" | "low" | "medium" | undefined;
            references?: string[] | undefined;
        };
        confidence: number;
        cvssV31Score: number;
        cvssV31Vector: string;
        cwe: string;
        title: string;
        attackerPersonas: ("unauthenticated_remote" | "authenticated_user" | "privileged_user" | "local_attacker" | "insider_threat" | "supply_chain" | "physical_access")[];
        exploitability: "trivial" | "easy" | "moderate" | "difficult" | "theoretical";
        locations: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }[];
        rootCause: string;
        severityLabel: "Critical" | "High" | "Medium" | "Low" | "Info";
        vulnId: string;
        truncated?: boolean | undefined;
        description?: string | undefined;
        schemaVersion?: string | undefined;
        additionalCwes?: string[] | undefined;
        assumptions?: {
            impact: "critical" | "major" | "minor";
            statement: string;
            justification?: string | undefined;
        }[] | undefined;
        businessImpact?: string | undefined;
        cvssV40Score?: number | null | undefined;
        cvssV40Vector?: string | null | undefined;
        dataFlowPath?: {
            location: {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            };
            description: string;
            isSanitizer?: boolean | undefined;
            isSink?: boolean | undefined;
            isSource?: boolean | undefined;
            taintLabel?: string | undefined;
        }[] | undefined;
        evidenceRefs?: {
            type: "code" | "tool_run" | "manual" | "data_flow";
            filePath?: string | undefined;
            description?: string | undefined;
            lineNumber?: number | undefined;
            entityId?: string | undefined;
        }[] | undefined;
        exploitPathSummary?: string | undefined;
        falsePositiveRisk?: "high" | "low" | "medium" | undefined;
        firstSeenAt?: string | undefined;
        owaspCategory?: string | undefined;
        relatedFindings?: string[] | undefined;
        tags?: string[] | undefined;
        toolRunRefs?: {
            toolName: string;
            timestamp: string;
            toolRunId: string;
            truncated?: boolean | undefined;
        }[] | undefined;
    }>, "many">;
    metadata: z.ZodObject<{
        /** Target branch if applicable */
        branch: z.ZodOptional<z.ZodString>;
        /** Target commit SHA if applicable */
        commitSha: z.ZodOptional<z.ZodString>;
        /** Coverage statistics */
        coverage: z.ZodOptional<z.ZodObject<{
            filesAnalyzed: z.ZodNumber;
            filesTotal: z.ZodOptional<z.ZodNumber>;
            linesAnalyzed: z.ZodOptional<z.ZodNumber>;
            percentComplete: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            filesAnalyzed: number;
            filesTotal?: number | undefined;
            linesAnalyzed?: number | undefined;
            percentComplete?: number | undefined;
        }, {
            filesAnalyzed: number;
            filesTotal?: number | undefined;
            linesAnalyzed?: number | undefined;
            percentComplete?: number | undefined;
        }>>;
        /** Total duration in milliseconds */
        durationMs: z.ZodOptional<z.ZodNumber>;
        /** Report generation timestamp */
        generatedAt: z.ZodString;
        /** Unique report ID */
        reportId: z.ZodString;
        /** Run ID that produced this report */
        runId: z.ZodString;
        /** Scan mode used */
        scanMode: z.ZodOptional<z.ZodString>;
        schemaVersion: z.ZodDefault<z.ZodString>;
        /** Target repository/project name */
        targetName: z.ZodOptional<z.ZodString>;
        /** Shadow Auditor version */
        toolVersion: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        schemaVersion: string;
        runId: string;
        generatedAt: string;
        reportId: string;
        toolVersion: string;
        durationMs?: number | undefined;
        coverage?: {
            filesAnalyzed: number;
            filesTotal?: number | undefined;
            linesAnalyzed?: number | undefined;
            percentComplete?: number | undefined;
        } | undefined;
        branch?: string | undefined;
        commitSha?: string | undefined;
        scanMode?: string | undefined;
        targetName?: string | undefined;
    }, {
        runId: string;
        generatedAt: string;
        reportId: string;
        toolVersion: string;
        schemaVersion?: string | undefined;
        durationMs?: number | undefined;
        coverage?: {
            filesAnalyzed: number;
            filesTotal?: number | undefined;
            linesAnalyzed?: number | undefined;
            percentComplete?: number | undefined;
        } | undefined;
        branch?: string | undefined;
        commitSha?: string | undefined;
        scanMode?: string | undefined;
        targetName?: string | undefined;
    }>;
    schemaVersion: z.ZodDefault<z.ZodString>;
    summary: z.ZodObject<{
        byConfidence: z.ZodObject<{
            high: z.ZodNumber;
            low: z.ZodNumber;
            medium: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            high: number;
            low: number;
            medium: number;
        }, {
            high: number;
            low: number;
            medium: number;
        }>;
        bySeverity: z.ZodObject<{
            critical: z.ZodNumber;
            high: z.ZodNumber;
            info: z.ZodNumber;
            low: z.ZodNumber;
            medium: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            critical: number;
            high: number;
            low: number;
            medium: number;
            info: number;
        }, {
            critical: number;
            high: number;
            low: number;
            medium: number;
            info: number;
        }>;
        riskScore: z.ZodOptional<z.ZodNumber>;
        topCwes: z.ZodOptional<z.ZodArray<z.ZodObject<{
            count: z.ZodNumber;
            cwe: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            cwe: string;
            count: number;
        }, {
            cwe: string;
            count: number;
        }>, "many">>;
        totalFindings: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        byConfidence: {
            high: number;
            low: number;
            medium: number;
        };
        bySeverity: {
            critical: number;
            high: number;
            low: number;
            medium: number;
            info: number;
        };
        totalFindings: number;
        riskScore?: number | undefined;
        topCwes?: {
            cwe: string;
            count: number;
        }[] | undefined;
    }, {
        byConfidence: {
            high: number;
            low: number;
            medium: number;
        };
        bySeverity: {
            critical: number;
            high: number;
            low: number;
            medium: number;
            info: number;
        };
        totalFindings: number;
        riskScore?: number | undefined;
        topCwes?: {
            cwe: string;
            count: number;
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    metadata: {
        schemaVersion: string;
        runId: string;
        generatedAt: string;
        reportId: string;
        toolVersion: string;
        durationMs?: number | undefined;
        coverage?: {
            filesAnalyzed: number;
            filesTotal?: number | undefined;
            linesAnalyzed?: number | undefined;
            percentComplete?: number | undefined;
        } | undefined;
        branch?: string | undefined;
        commitSha?: string | undefined;
        scanMode?: string | undefined;
        targetName?: string | undefined;
    };
    findings: {
        remediation: {
            breakingChange: boolean;
            summary: string;
            steps?: string[] | undefined;
            codeExample?: string | undefined;
            effort?: "high" | "low" | "medium" | undefined;
            references?: string[] | undefined;
        };
        truncated: boolean;
        schemaVersion: string;
        confidence: number;
        cvssV31Score: number;
        cvssV31Vector: string;
        cwe: string;
        title: string;
        attackerPersonas: ("unauthenticated_remote" | "authenticated_user" | "privileged_user" | "local_attacker" | "insider_threat" | "supply_chain" | "physical_access")[];
        exploitability: "trivial" | "easy" | "moderate" | "difficult" | "theoretical";
        locations: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }[];
        rootCause: string;
        severityLabel: "Critical" | "High" | "Medium" | "Low" | "Info";
        vulnId: string;
        description?: string | undefined;
        additionalCwes?: string[] | undefined;
        assumptions?: {
            impact: "critical" | "major" | "minor";
            statement: string;
            justification?: string | undefined;
        }[] | undefined;
        businessImpact?: string | undefined;
        cvssV40Score?: number | null | undefined;
        cvssV40Vector?: string | null | undefined;
        dataFlowPath?: {
            location: {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            };
            description: string;
            isSanitizer: boolean;
            isSink: boolean;
            isSource: boolean;
            taintLabel?: string | undefined;
        }[] | undefined;
        evidenceRefs?: {
            type: "code" | "tool_run" | "manual" | "data_flow";
            filePath?: string | undefined;
            description?: string | undefined;
            lineNumber?: number | undefined;
            entityId?: string | undefined;
        }[] | undefined;
        exploitPathSummary?: string | undefined;
        falsePositiveRisk?: "high" | "low" | "medium" | undefined;
        firstSeenAt?: string | undefined;
        owaspCategory?: string | undefined;
        relatedFindings?: string[] | undefined;
        tags?: string[] | undefined;
        toolRunRefs?: {
            toolName: string;
            truncated: boolean;
            timestamp: string;
            toolRunId: string;
        }[] | undefined;
    }[];
    summary: {
        byConfidence: {
            high: number;
            low: number;
            medium: number;
        };
        bySeverity: {
            critical: number;
            high: number;
            low: number;
            medium: number;
            info: number;
        };
        totalFindings: number;
        riskScore?: number | undefined;
        topCwes?: {
            cwe: string;
            count: number;
        }[] | undefined;
    };
}, {
    metadata: {
        runId: string;
        generatedAt: string;
        reportId: string;
        toolVersion: string;
        schemaVersion?: string | undefined;
        durationMs?: number | undefined;
        coverage?: {
            filesAnalyzed: number;
            filesTotal?: number | undefined;
            linesAnalyzed?: number | undefined;
            percentComplete?: number | undefined;
        } | undefined;
        branch?: string | undefined;
        commitSha?: string | undefined;
        scanMode?: string | undefined;
        targetName?: string | undefined;
    };
    findings: {
        remediation: {
            summary: string;
            steps?: string[] | undefined;
            breakingChange?: boolean | undefined;
            codeExample?: string | undefined;
            effort?: "high" | "low" | "medium" | undefined;
            references?: string[] | undefined;
        };
        confidence: number;
        cvssV31Score: number;
        cvssV31Vector: string;
        cwe: string;
        title: string;
        attackerPersonas: ("unauthenticated_remote" | "authenticated_user" | "privileged_user" | "local_attacker" | "insider_threat" | "supply_chain" | "physical_access")[];
        exploitability: "trivial" | "easy" | "moderate" | "difficult" | "theoretical";
        locations: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
            className?: string | undefined;
            functionName?: string | undefined;
            snippet?: string | undefined;
            snippetHash?: string | undefined;
        }[];
        rootCause: string;
        severityLabel: "Critical" | "High" | "Medium" | "Low" | "Info";
        vulnId: string;
        truncated?: boolean | undefined;
        description?: string | undefined;
        schemaVersion?: string | undefined;
        additionalCwes?: string[] | undefined;
        assumptions?: {
            impact: "critical" | "major" | "minor";
            statement: string;
            justification?: string | undefined;
        }[] | undefined;
        businessImpact?: string | undefined;
        cvssV40Score?: number | null | undefined;
        cvssV40Vector?: string | null | undefined;
        dataFlowPath?: {
            location: {
                filePath: string;
                endColumn?: number | undefined;
                endLine?: number | undefined;
                startColumn?: number | undefined;
                startLine?: number | undefined;
                className?: string | undefined;
                functionName?: string | undefined;
                snippet?: string | undefined;
                snippetHash?: string | undefined;
            };
            description: string;
            isSanitizer?: boolean | undefined;
            isSink?: boolean | undefined;
            isSource?: boolean | undefined;
            taintLabel?: string | undefined;
        }[] | undefined;
        evidenceRefs?: {
            type: "code" | "tool_run" | "manual" | "data_flow";
            filePath?: string | undefined;
            description?: string | undefined;
            lineNumber?: number | undefined;
            entityId?: string | undefined;
        }[] | undefined;
        exploitPathSummary?: string | undefined;
        falsePositiveRisk?: "high" | "low" | "medium" | undefined;
        firstSeenAt?: string | undefined;
        owaspCategory?: string | undefined;
        relatedFindings?: string[] | undefined;
        tags?: string[] | undefined;
        toolRunRefs?: {
            toolName: string;
            timestamp: string;
            toolRunId: string;
            truncated?: boolean | undefined;
        }[] | undefined;
    }[];
    summary: {
        byConfidence: {
            high: number;
            low: number;
            medium: number;
        };
        bySeverity: {
            critical: number;
            high: number;
            low: number;
            medium: number;
            info: number;
        };
        totalFindings: number;
        riskScore?: number | undefined;
        topCwes?: {
            cwe: string;
            count: number;
        }[] | undefined;
    };
    schemaVersion?: string | undefined;
}>;
export type EnhancedReport = z.infer<typeof enhancedReportSchema>;
/**
 * Validate a finding and return detailed errors.
 */
export declare function validateFinding(finding: unknown): {
    errors: string[];
    valid: boolean;
};
/**
 * Validate a complete report.
 */
export declare function validateReport(report: unknown): {
    errors: string[];
    valid: boolean;
};
/**
 * Builder for creating enhanced findings.
 */
export declare class FindingBuilder {
    private finding;
    constructor(vulnId: string, title: string);
    assumption(stmt: string, impact: Assumption['impact'], justification?: string): this;
    attackers(...personas: AttackerPersona[]): this;
    build(): EnhancedFinding;
    confidence(score: number): this;
    cvss40(score: number, vector: string): this;
    cwe(primary: string, additional?: string[]): this;
    dataFlow(steps: DataFlowStep[]): this;
    description(desc: string): this;
    evidence(refs: EnhancedFinding['evidenceRefs']): this;
    exploitability(level: Exploitability): this;
    exploitPath(summary: string): this;
    location(loc: CodeLocation): this;
    remediation(rem: Remediation): this;
    rootCause(cause: string): this;
    severity(label: EnhancedFinding['severityLabel'], cvss31Score: number, cvss31Vector: string): this;
    tags(...tags: string[]): this;
    toolRuns(refs: EnhancedFinding['toolRunRefs']): this;
    truncated(value?: boolean): this;
}
