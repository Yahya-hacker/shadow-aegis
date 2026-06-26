/**
 * Base schemas and utilities for Shadow Auditor type system.
 * All persisted artifacts and inter-module messages use these schemas.
 */
import { createHash } from 'node:crypto';
import { z } from 'zod';
// Schema version for migration support
export const SCHEMA_VERSION = '1.0.0';
/**
 * Canonical ID schema - used for deterministic, reproducible identifiers.
 * Format: {prefix}_{hash_hex} where hash is derived from content.
 */
export const canonicalIdSchema = z
    .string()
    .min(3)
    .regex(/^[a-z_]+_[a-f0-9]{8,64}$/, 'Invalid canonical ID format');
/**
 * Short UUID schema for runtime identifiers.
 */
export const shortIdSchema = z.string().min(8).max(36);
/**
 * ISO timestamp schema.
 */
export const timestampSchema = z.string().datetime({ offset: true });
/**
 * Confidence score schema - bounded probability [0, 1].
 */
export const confidenceSchema = z.number().min(0).max(1);
/**
 * Severity levels aligned with CVSS.
 */
export const severityLabelSchema = z.enum(['Critical', 'High', 'Medium', 'Low', 'Info']);
// Alias for compatibility
export const severitySchema = severityLabelSchema;
/**
 * File location with optional line range.
 */
export const fileLocationSchema = z.object({
    endColumn: z.number().int().positive().optional(),
    endLine: z.number().int().positive().optional(),
    filePath: z.string().min(1),
    startColumn: z.number().int().positive().optional(),
    startLine: z.number().int().positive().optional(),
});
/**
 * Code evidence extracted from actual source.
 */
export const codeEvidenceSchema = z.object({
    codeSnippet: z.string().min(1),
    hash: z.string().min(8).describe('SHA-256 of snippet for dedup'),
    language: z.string().optional(),
    location: fileLocationSchema,
});
/**
 * Tool execution reference - links findings to tool runs.
 */
export const toolRunRefSchema = z.object({
    toolCallId: z.string().min(1),
    toolName: z.string().min(1),
    truncated: z.boolean().default(false),
});
/**
 * Evidence reference union - supports multiple evidence types.
 */
export const evidenceRefSchema = z.discriminatedUnion('type', [
    z.object({
        evidence: codeEvidenceSchema,
        type: z.literal('code'),
    }),
    z.object({
        evidence: toolRunRefSchema,
        type: z.literal('tool_run'),
    }),
    z.object({
        description: z.string().min(1),
        type: z.literal('manual'),
    }),
]);
/**
 * Schema-aware wrapper for persisted artifacts.
 */
export const versionedArtifactSchema = (dataSchema) => z.object({
    createdAt: timestampSchema,
    data: dataSchema,
    schemaVersion: z.string().default(SCHEMA_VERSION),
    updatedAt: timestampSchema,
});
/**
 * Create a success result.
 */
export function ok(value) {
    return { ok: true, value: value };
}
/**
 * Create an error result.
 */
export function err(error) {
    return { error, ok: false };
}
/**
 * Deterministic hash for canonical ID generation.
 */
export function computeCanonicalHash(content, prefix) {
    const hash = createHash('sha256').update(content).digest('hex').slice(0, 16);
    return `${prefix}_${hash}`;
}
/**
 * Safe JSON parse with schema validation.
 */
export function safeParseJson(schema, jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        const validated = schema.safeParse(parsed);
        if (!validated.success) {
            const issues = validated.error.issues
                .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
                .join('; ');
            return err(`Schema validation failed: ${issues}`);
        }
        return ok(validated.data);
    }
    catch (error) {
        return err(`JSON parse error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
