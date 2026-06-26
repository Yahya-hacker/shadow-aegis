/**
 * Base schemas and utilities for Shadow Auditor type system.
 * All persisted artifacts and inter-module messages use these schemas.
 */
import { z } from 'zod';
export declare const SCHEMA_VERSION = "1.0.0";
/**
 * Canonical ID schema - used for deterministic, reproducible identifiers.
 * Format: {prefix}_{hash_hex} where hash is derived from content.
 */
export declare const canonicalIdSchema: z.ZodString;
/**
 * Short UUID schema for runtime identifiers.
 */
export declare const shortIdSchema: z.ZodString;
/**
 * ISO timestamp schema.
 */
export declare const timestampSchema: z.ZodString;
/**
 * Confidence score schema - bounded probability [0, 1].
 */
export declare const confidenceSchema: z.ZodNumber;
/**
 * Severity levels aligned with CVSS.
 */
export declare const severityLabelSchema: z.ZodEnum<["Critical", "High", "Medium", "Low", "Info"]>;
export type SeverityLabel = z.infer<typeof severityLabelSchema>;
export declare const severitySchema: z.ZodEnum<["Critical", "High", "Medium", "Low", "Info"]>;
/**
 * File location with optional line range.
 */
export declare const fileLocationSchema: z.ZodObject<{
    endColumn: z.ZodOptional<z.ZodNumber>;
    endLine: z.ZodOptional<z.ZodNumber>;
    filePath: z.ZodString;
    startColumn: z.ZodOptional<z.ZodNumber>;
    startLine: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    endColumn?: number | undefined;
    endLine?: number | undefined;
    startColumn?: number | undefined;
    startLine?: number | undefined;
}, {
    filePath: string;
    endColumn?: number | undefined;
    endLine?: number | undefined;
    startColumn?: number | undefined;
    startLine?: number | undefined;
}>;
export type FileLocation = z.infer<typeof fileLocationSchema>;
/**
 * Code evidence extracted from actual source.
 */
export declare const codeEvidenceSchema: z.ZodObject<{
    codeSnippet: z.ZodString;
    hash: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    location: z.ZodObject<{
        endColumn: z.ZodOptional<z.ZodNumber>;
        endLine: z.ZodOptional<z.ZodNumber>;
        filePath: z.ZodString;
        startColumn: z.ZodOptional<z.ZodNumber>;
        startLine: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
    }, {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    codeSnippet: string;
    hash: string;
    location: {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
    };
    language?: string | undefined;
}, {
    codeSnippet: string;
    hash: string;
    location: {
        filePath: string;
        endColumn?: number | undefined;
        endLine?: number | undefined;
        startColumn?: number | undefined;
        startLine?: number | undefined;
    };
    language?: string | undefined;
}>;
export type CodeEvidence = z.infer<typeof codeEvidenceSchema>;
/**
 * Tool execution reference - links findings to tool runs.
 */
export declare const toolRunRefSchema: z.ZodObject<{
    toolCallId: z.ZodString;
    toolName: z.ZodString;
    truncated: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    toolCallId: string;
    toolName: string;
    truncated: boolean;
}, {
    toolCallId: string;
    toolName: string;
    truncated?: boolean | undefined;
}>;
export type ToolRunRef = z.infer<typeof toolRunRefSchema>;
/**
 * Evidence reference union - supports multiple evidence types.
 */
export declare const evidenceRefSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    evidence: z.ZodObject<{
        codeSnippet: z.ZodString;
        hash: z.ZodString;
        language: z.ZodOptional<z.ZodString>;
        location: z.ZodObject<{
            endColumn: z.ZodOptional<z.ZodNumber>;
            endLine: z.ZodOptional<z.ZodNumber>;
            filePath: z.ZodString;
            startColumn: z.ZodOptional<z.ZodNumber>;
            startLine: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
        }, {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        codeSnippet: string;
        hash: string;
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
        };
        language?: string | undefined;
    }, {
        codeSnippet: string;
        hash: string;
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
        };
        language?: string | undefined;
    }>;
    type: z.ZodLiteral<"code">;
}, "strip", z.ZodTypeAny, {
    type: "code";
    evidence: {
        codeSnippet: string;
        hash: string;
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
        };
        language?: string | undefined;
    };
}, {
    type: "code";
    evidence: {
        codeSnippet: string;
        hash: string;
        location: {
            filePath: string;
            endColumn?: number | undefined;
            endLine?: number | undefined;
            startColumn?: number | undefined;
            startLine?: number | undefined;
        };
        language?: string | undefined;
    };
}>, z.ZodObject<{
    evidence: z.ZodObject<{
        toolCallId: z.ZodString;
        toolName: z.ZodString;
        truncated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        toolName: string;
        truncated: boolean;
    }, {
        toolCallId: string;
        toolName: string;
        truncated?: boolean | undefined;
    }>;
    type: z.ZodLiteral<"tool_run">;
}, "strip", z.ZodTypeAny, {
    type: "tool_run";
    evidence: {
        toolCallId: string;
        toolName: string;
        truncated: boolean;
    };
}, {
    type: "tool_run";
    evidence: {
        toolCallId: string;
        toolName: string;
        truncated?: boolean | undefined;
    };
}>, z.ZodObject<{
    description: z.ZodString;
    type: z.ZodLiteral<"manual">;
}, "strip", z.ZodTypeAny, {
    type: "manual";
    description: string;
}, {
    type: "manual";
    description: string;
}>]>;
export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
/**
 * Schema-aware wrapper for persisted artifacts.
 */
export declare const versionedArtifactSchema: <T extends z.ZodTypeAny>(dataSchema: T) => z.ZodObject<{
    createdAt: z.ZodString;
    data: T;
    schemaVersion: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    createdAt: z.ZodString;
    data: T;
    schemaVersion: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodString;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    createdAt: z.ZodString;
    data: T;
    schemaVersion: z.ZodDefault<z.ZodString>;
    updatedAt: z.ZodString;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
/**
 * Result wrapper for operations that may fail.
 */
export type Result<T, E = Error> = {
    error: E;
    ok: false;
} | {
    ok: true;
    value: T;
};
/**
 * Create a success result.
 */
export declare function ok<T = void>(value?: T): Result<T, never>;
/**
 * Create an error result.
 */
export declare function err<E>(error: E): Result<never, E>;
/**
 * Deterministic hash for canonical ID generation.
 */
export declare function computeCanonicalHash(content: string, prefix: string): string;
/**
 * Safe JSON parse with schema validation.
 */
export declare function safeParseJson<T extends z.ZodTypeAny>(schema: T, jsonString: string): Result<z.infer<T>, string>;
