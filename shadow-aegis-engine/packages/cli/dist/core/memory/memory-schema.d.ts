/**
 * Memory Fabric Schemas - Typed contracts for knowledge graph and event store.
 */
import { z } from 'zod';
export declare const entityTypeSchema: z.ZodEnum<["file", "function", "class", "endpoint", "sink", "source", "variable", "vulnerability", "tool_run", "technology", "credential", "data_type", "chunk"]>;
export type EntityType = z.infer<typeof entityTypeSchema>;
/**
 * Base entity schema - all entities share these fields.
 */
export declare const baseEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    entityType: z.ZodEnum<["file", "function", "class", "endpoint", "sink", "source", "variable", "vulnerability", "tool_run", "technology", "credential", "data_type", "chunk"]>;
    label: z.ZodString;
    properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "function" | "class" | "file" | "tool_run" | "endpoint" | "sink" | "source" | "variable" | "vulnerability" | "technology" | "credential" | "data_type" | "chunk";
    label: string;
    properties: Record<string, unknown>;
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "function" | "class" | "file" | "tool_run" | "endpoint" | "sink" | "source" | "variable" | "vulnerability" | "technology" | "credential" | "data_type" | "chunk";
    label: string;
    confidence?: number | undefined;
    properties?: Record<string, unknown> | undefined;
}>;
export type BaseEntity = z.infer<typeof baseEntitySchema>;
/**
 * File entity - represents a source code file.
 */
export declare const fileEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    label: z.ZodString;
    updatedAt: z.ZodString;
} & {
    entityType: z.ZodLiteral<"file">;
    properties: z.ZodObject<{
        language: z.ZodOptional<z.ZodString>;
        lineCount: z.ZodOptional<z.ZodNumber>;
        path: z.ZodString;
        sha256: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        language?: string | undefined;
        sha256?: string | undefined;
        lineCount?: number | undefined;
    }, {
        path: string;
        language?: string | undefined;
        sha256?: string | undefined;
        lineCount?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "file";
    label: string;
    properties: {
        path: string;
        language?: string | undefined;
        sha256?: string | undefined;
        lineCount?: number | undefined;
    };
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "file";
    label: string;
    properties: {
        path: string;
        language?: string | undefined;
        sha256?: string | undefined;
        lineCount?: number | undefined;
    };
    confidence?: number | undefined;
}>;
export type FileEntity = z.infer<typeof fileEntitySchema>;
/**
 * Function entity - represents a function or method.
 */
export declare const functionEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    label: z.ZodString;
    updatedAt: z.ZodString;
} & {
    entityType: z.ZodLiteral<"function">;
    properties: z.ZodObject<{
        async: z.ZodOptional<z.ZodBoolean>;
        className: z.ZodOptional<z.ZodString>;
        fileCanonicalId: z.ZodString;
        lineEnd: z.ZodOptional<z.ZodNumber>;
        lineStart: z.ZodNumber;
        name: z.ZodString;
        parameters: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        returnType: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        parameters: string[];
        fileCanonicalId: string;
        lineStart: number;
        name: string;
        async?: boolean | undefined;
        className?: string | undefined;
        lineEnd?: number | undefined;
        returnType?: string | undefined;
    }, {
        fileCanonicalId: string;
        lineStart: number;
        name: string;
        parameters?: string[] | undefined;
        async?: boolean | undefined;
        className?: string | undefined;
        lineEnd?: number | undefined;
        returnType?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "function";
    label: string;
    properties: {
        parameters: string[];
        fileCanonicalId: string;
        lineStart: number;
        name: string;
        async?: boolean | undefined;
        className?: string | undefined;
        lineEnd?: number | undefined;
        returnType?: string | undefined;
    };
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "function";
    label: string;
    properties: {
        fileCanonicalId: string;
        lineStart: number;
        name: string;
        parameters?: string[] | undefined;
        async?: boolean | undefined;
        className?: string | undefined;
        lineEnd?: number | undefined;
        returnType?: string | undefined;
    };
    confidence?: number | undefined;
}>;
export type FunctionEntity = z.infer<typeof functionEntitySchema>;
/**
 * Sink entity - data sink (e.g., eval, SQL query, DOM manipulation).
 */
export declare const sinkEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    label: z.ZodString;
    updatedAt: z.ZodString;
} & {
    entityType: z.ZodLiteral<"sink">;
    properties: z.ZodObject<{
        category: z.ZodEnum<["execution", "sql", "dom", "file", "network", "crypto", "other"]>;
        fileCanonicalId: z.ZodString;
        functionCanonicalId: z.ZodOptional<z.ZodString>;
        lineNumber: z.ZodNumber;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fileCanonicalId: string;
        name: string;
        category: "file" | "execution" | "sql" | "dom" | "network" | "crypto" | "other";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    }, {
        fileCanonicalId: string;
        name: string;
        category: "file" | "execution" | "sql" | "dom" | "network" | "crypto" | "other";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "sink";
    label: string;
    properties: {
        fileCanonicalId: string;
        name: string;
        category: "file" | "execution" | "sql" | "dom" | "network" | "crypto" | "other";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    };
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "sink";
    label: string;
    properties: {
        fileCanonicalId: string;
        name: string;
        category: "file" | "execution" | "sql" | "dom" | "network" | "crypto" | "other";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    };
    confidence?: number | undefined;
}>;
export type SinkEntity = z.infer<typeof sinkEntitySchema>;
/**
 * Source entity - user-controlled input source.
 */
export declare const sourceEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    label: z.ZodString;
    updatedAt: z.ZodString;
} & {
    entityType: z.ZodLiteral<"source">;
    properties: z.ZodObject<{
        category: z.ZodEnum<["request", "cookie", "storage", "url", "database", "file", "env", "other"]>;
        fileCanonicalId: z.ZodString;
        functionCanonicalId: z.ZodOptional<z.ZodString>;
        lineNumber: z.ZodNumber;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        fileCanonicalId: string;
        name: string;
        category: "file" | "other" | "request" | "cookie" | "storage" | "url" | "database" | "env";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    }, {
        fileCanonicalId: string;
        name: string;
        category: "file" | "other" | "request" | "cookie" | "storage" | "url" | "database" | "env";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "source";
    label: string;
    properties: {
        fileCanonicalId: string;
        name: string;
        category: "file" | "other" | "request" | "cookie" | "storage" | "url" | "database" | "env";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    };
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "source";
    label: string;
    properties: {
        fileCanonicalId: string;
        name: string;
        category: "file" | "other" | "request" | "cookie" | "storage" | "url" | "database" | "env";
        lineNumber: number;
        functionCanonicalId?: string | undefined;
    };
    confidence?: number | undefined;
}>;
export type SourceEntity = z.infer<typeof sourceEntitySchema>;
/**
 * Vulnerability entity - a confirmed or hypothesized vulnerability.
 */
export declare const vulnerabilityEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    label: z.ZodString;
    updatedAt: z.ZodString;
} & {
    entityType: z.ZodLiteral<"vulnerability">;
    properties: z.ZodObject<{
        cvssV31Score: z.ZodOptional<z.ZodNumber>;
        cvssV31Vector: z.ZodOptional<z.ZodString>;
        cwe: z.ZodString;
        exploitPath: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sinkCanonicalId: z.ZodOptional<z.ZodString>;
        sourceCanonicalId: z.ZodOptional<z.ZodString>;
        title: z.ZodString;
        verified: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        verified: boolean;
        cwe: string;
        title: string;
        cvssV31Score?: number | undefined;
        cvssV31Vector?: string | undefined;
        exploitPath?: string[] | undefined;
        sinkCanonicalId?: string | undefined;
        sourceCanonicalId?: string | undefined;
    }, {
        cwe: string;
        title: string;
        verified?: boolean | undefined;
        cvssV31Score?: number | undefined;
        cvssV31Vector?: string | undefined;
        exploitPath?: string[] | undefined;
        sinkCanonicalId?: string | undefined;
        sourceCanonicalId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "vulnerability";
    label: string;
    properties: {
        verified: boolean;
        cwe: string;
        title: string;
        cvssV31Score?: number | undefined;
        cvssV31Vector?: string | undefined;
        exploitPath?: string[] | undefined;
        sinkCanonicalId?: string | undefined;
        sourceCanonicalId?: string | undefined;
    };
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "vulnerability";
    label: string;
    properties: {
        cwe: string;
        title: string;
        verified?: boolean | undefined;
        cvssV31Score?: number | undefined;
        cvssV31Vector?: string | undefined;
        exploitPath?: string[] | undefined;
        sinkCanonicalId?: string | undefined;
        sourceCanonicalId?: string | undefined;
    };
    confidence?: number | undefined;
}>;
export type VulnerabilityEntity = z.infer<typeof vulnerabilityEntitySchema>;
/**
 * Tool run entity - records a tool execution.
 */
export declare const toolRunEntitySchema: z.ZodObject<{
    canonicalId: z.ZodString;
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    label: z.ZodString;
    updatedAt: z.ZodString;
} & {
    entityType: z.ZodLiteral<"tool_run">;
    properties: z.ZodObject<{
        durationMs: z.ZodOptional<z.ZodNumber>;
        input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        output: z.ZodOptional<z.ZodUnknown>;
        success: z.ZodBoolean;
        toolCallId: z.ZodString;
        toolName: z.ZodString;
        truncated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        toolCallId: string;
        toolName: string;
        truncated: boolean;
        input: Record<string, unknown>;
        success: boolean;
        durationMs?: number | undefined;
        output?: unknown;
    }, {
        toolCallId: string;
        toolName: string;
        input: Record<string, unknown>;
        success: boolean;
        truncated?: boolean | undefined;
        durationMs?: number | undefined;
        output?: unknown;
    }>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    updatedAt: string;
    confidence: number;
    canonicalId: string;
    entityType: "tool_run";
    label: string;
    properties: {
        toolCallId: string;
        toolName: string;
        truncated: boolean;
        input: Record<string, unknown>;
        success: boolean;
        durationMs?: number | undefined;
        output?: unknown;
    };
}, {
    createdAt: string;
    updatedAt: string;
    canonicalId: string;
    entityType: "tool_run";
    label: string;
    properties: {
        toolCallId: string;
        toolName: string;
        input: Record<string, unknown>;
        success: boolean;
        truncated?: boolean | undefined;
        durationMs?: number | undefined;
        output?: unknown;
    };
    confidence?: number | undefined;
}>;
export type ToolRunEntity = z.infer<typeof toolRunEntitySchema>;
export declare const edgeTypeSchema: z.ZodEnum<["calls", "flows_to", "guards", "touches", "exploits", "contains", "depends_on", "validates", "hypothesizes", "embeds"]>;
export type EdgeType = z.infer<typeof edgeTypeSchema>;
/**
 * Graph edge schema.
 */
export declare const graphEdgeSchema: z.ZodObject<{
    confidence: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodString;
    edgeId: z.ZodString;
    edgeType: z.ZodEnum<["calls", "flows_to", "guards", "touches", "exploits", "contains", "depends_on", "validates", "hypothesizes", "embeds"]>;
    metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    sourceEntityId: z.ZodString;
    targetEntityId: z.ZodString;
    validated: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    createdAt: string;
    confidence: number;
    edgeId: string;
    edgeType: "calls" | "flows_to" | "guards" | "touches" | "exploits" | "contains" | "depends_on" | "validates" | "hypothesizes" | "embeds";
    metadata: Record<string, unknown>;
    sourceEntityId: string;
    targetEntityId: string;
    validated: boolean;
}, {
    createdAt: string;
    edgeId: string;
    edgeType: "calls" | "flows_to" | "guards" | "touches" | "exploits" | "contains" | "depends_on" | "validates" | "hypothesizes" | "embeds";
    sourceEntityId: string;
    targetEntityId: string;
    confidence?: number | undefined;
    metadata?: Record<string, unknown> | undefined;
    validated?: boolean | undefined;
}>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;
export declare const eventTypeSchema: z.ZodEnum<["entity_added", "entity_updated", "edge_added", "edge_removed", "tool_call", "tool_result", "hypothesis_created", "hypothesis_verified", "hypothesis_rejected", "checkpoint_created", "checkpoint_restored", "state_transition", "mission_started", "mission_completed", "finding_created"]>;
export type EventType = z.infer<typeof eventTypeSchema>;
/**
 * Event schema for append-only log.
 */
export declare const eventSchema: z.ZodObject<{
    eventId: z.ZodString;
    eventType: z.ZodEnum<["entity_added", "entity_updated", "edge_added", "edge_removed", "tool_call", "tool_result", "hypothesis_created", "hypothesis_verified", "hypothesis_rejected", "checkpoint_created", "checkpoint_restored", "state_transition", "mission_started", "mission_completed", "finding_created"]>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    runId: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    timestamp: string;
    eventId: string;
    eventType: "entity_added" | "entity_updated" | "edge_added" | "edge_removed" | "tool_call" | "tool_result" | "hypothesis_created" | "hypothesis_verified" | "hypothesis_rejected" | "checkpoint_created" | "checkpoint_restored" | "state_transition" | "mission_started" | "mission_completed" | "finding_created";
    payload: Record<string, unknown>;
    runId: string;
}, {
    timestamp: string;
    eventId: string;
    eventType: "entity_added" | "entity_updated" | "edge_added" | "edge_removed" | "tool_call" | "tool_result" | "hypothesis_created" | "hypothesis_verified" | "hypothesis_rejected" | "checkpoint_created" | "checkpoint_restored" | "state_transition" | "mission_started" | "mission_completed" | "finding_created";
    payload: Record<string, unknown>;
    runId: string;
    schemaVersion?: string | undefined;
}>;
export type Event = z.infer<typeof eventSchema>;
export declare const knowledgeGraphStateSchema: z.ZodObject<{
    edges: z.ZodRecord<z.ZodString, z.ZodObject<{
        confidence: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodString;
        edgeId: z.ZodString;
        edgeType: z.ZodEnum<["calls", "flows_to", "guards", "touches", "exploits", "contains", "depends_on", "validates", "hypothesizes", "embeds"]>;
        metadata: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        sourceEntityId: z.ZodString;
        targetEntityId: z.ZodString;
        validated: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        confidence: number;
        edgeId: string;
        edgeType: "calls" | "flows_to" | "guards" | "touches" | "exploits" | "contains" | "depends_on" | "validates" | "hypothesizes" | "embeds";
        metadata: Record<string, unknown>;
        sourceEntityId: string;
        targetEntityId: string;
        validated: boolean;
    }, {
        createdAt: string;
        edgeId: string;
        edgeType: "calls" | "flows_to" | "guards" | "touches" | "exploits" | "contains" | "depends_on" | "validates" | "hypothesizes" | "embeds";
        sourceEntityId: string;
        targetEntityId: string;
        confidence?: number | undefined;
        metadata?: Record<string, unknown> | undefined;
        validated?: boolean | undefined;
    }>>;
    entities: z.ZodRecord<z.ZodString, z.ZodObject<{
        canonicalId: z.ZodString;
        confidence: z.ZodDefault<z.ZodNumber>;
        createdAt: z.ZodString;
        entityType: z.ZodEnum<["file", "function", "class", "endpoint", "sink", "source", "variable", "vulnerability", "tool_run", "technology", "credential", "data_type", "chunk"]>;
        label: z.ZodString;
        properties: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        createdAt: string;
        updatedAt: string;
        confidence: number;
        canonicalId: string;
        entityType: "function" | "class" | "file" | "tool_run" | "endpoint" | "sink" | "source" | "variable" | "vulnerability" | "technology" | "credential" | "data_type" | "chunk";
        label: string;
        properties: Record<string, unknown>;
    }, {
        createdAt: string;
        updatedAt: string;
        canonicalId: string;
        entityType: "function" | "class" | "file" | "tool_run" | "endpoint" | "sink" | "source" | "variable" | "vulnerability" | "technology" | "credential" | "data_type" | "chunk";
        label: string;
        confidence?: number | undefined;
        properties?: Record<string, unknown> | undefined;
    }>>;
    runId: z.ZodString;
    schemaVersion: z.ZodDefault<z.ZodString>;
    snapshotAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    runId: string;
    edges: Record<string, {
        createdAt: string;
        confidence: number;
        edgeId: string;
        edgeType: "calls" | "flows_to" | "guards" | "touches" | "exploits" | "contains" | "depends_on" | "validates" | "hypothesizes" | "embeds";
        metadata: Record<string, unknown>;
        sourceEntityId: string;
        targetEntityId: string;
        validated: boolean;
    }>;
    entities: Record<string, {
        createdAt: string;
        updatedAt: string;
        confidence: number;
        canonicalId: string;
        entityType: "function" | "class" | "file" | "tool_run" | "endpoint" | "sink" | "source" | "variable" | "vulnerability" | "technology" | "credential" | "data_type" | "chunk";
        label: string;
        properties: Record<string, unknown>;
    }>;
    snapshotAt: string;
}, {
    runId: string;
    edges: Record<string, {
        createdAt: string;
        edgeId: string;
        edgeType: "calls" | "flows_to" | "guards" | "touches" | "exploits" | "contains" | "depends_on" | "validates" | "hypothesizes" | "embeds";
        sourceEntityId: string;
        targetEntityId: string;
        confidence?: number | undefined;
        metadata?: Record<string, unknown> | undefined;
        validated?: boolean | undefined;
    }>;
    entities: Record<string, {
        createdAt: string;
        updatedAt: string;
        canonicalId: string;
        entityType: "function" | "class" | "file" | "tool_run" | "endpoint" | "sink" | "source" | "variable" | "vulnerability" | "technology" | "credential" | "data_type" | "chunk";
        label: string;
        confidence?: number | undefined;
        properties?: Record<string, unknown> | undefined;
    }>;
    snapshotAt: string;
    schemaVersion?: string | undefined;
}>;
export type KnowledgeGraphState = z.infer<typeof knowledgeGraphStateSchema>;
