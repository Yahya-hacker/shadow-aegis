/**
 * DAST Schema - Typed contracts for dynamic application security testing.
 *
 * Defines Zod schemas for sandbox execution evidence, OAST callbacks,
 * and exploit proof-of-concept records.
 */
import { z } from 'zod';
export declare const sandboxExecResultSchema: z.ZodObject<{
    command: z.ZodString;
    durationMs: z.ZodNumber;
    exitCode: z.ZodNumber;
    stderr: z.ZodString;
    stdout: z.ZodString;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    durationMs: number;
    command: string;
    stderr: string;
    stdout: string;
    exitCode: number;
}, {
    timestamp: string;
    durationMs: number;
    command: string;
    stderr: string;
    stdout: string;
    exitCode: number;
}>;
export type SandboxExecResult = z.infer<typeof sandboxExecResultSchema>;
export declare const oastCallbackSchema: z.ZodObject<{
    headers: z.ZodRecord<z.ZodString, z.ZodString>;
    method: z.ZodString;
    requestBody: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
    url: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    requestBody?: string | undefined;
}, {
    timestamp: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    requestBody?: string | undefined;
}>;
export type OastCallback = z.infer<typeof oastCallbackSchema>;
export declare const dastValidationResultSchema: z.ZodObject<{
    endpoint: z.ZodString;
    method: z.ZodString;
    oastCallbacks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        headers: z.ZodRecord<z.ZodString, z.ZodString>;
        method: z.ZodString;
        requestBody: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }, {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }>, "many">>;
    payload: z.ZodString;
    responseBody: z.ZodOptional<z.ZodString>;
    responseStatus: z.ZodOptional<z.ZodNumber>;
    validated: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    endpoint: string;
    validated: boolean;
    payload: string;
    method: string;
    oastCallbacks: {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }[];
    responseBody?: string | undefined;
    responseStatus?: number | undefined;
}, {
    endpoint: string;
    validated: boolean;
    payload: string;
    method: string;
    oastCallbacks?: {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }[] | undefined;
    responseBody?: string | undefined;
    responseStatus?: number | undefined;
}>;
export type DastValidationResult = z.infer<typeof dastValidationResultSchema>;
export declare const exploitProofOfConceptSchema: z.ZodObject<{
    /** The DAST validation result (payload, response, etc.) */
    dastResult: z.ZodOptional<z.ZodObject<{
        endpoint: z.ZodString;
        method: z.ZodString;
        oastCallbacks: z.ZodDefault<z.ZodArray<z.ZodObject<{
            headers: z.ZodRecord<z.ZodString, z.ZodString>;
            method: z.ZodString;
            requestBody: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            url: string;
            method: string;
            headers: Record<string, string>;
            requestBody?: string | undefined;
        }, {
            timestamp: string;
            url: string;
            method: string;
            headers: Record<string, string>;
            requestBody?: string | undefined;
        }>, "many">>;
        payload: z.ZodString;
        responseBody: z.ZodOptional<z.ZodString>;
        responseStatus: z.ZodOptional<z.ZodNumber>;
        validated: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        endpoint: string;
        validated: boolean;
        payload: string;
        method: string;
        oastCallbacks: {
            timestamp: string;
            url: string;
            method: string;
            headers: Record<string, string>;
            requestBody?: string | undefined;
        }[];
        responseBody?: string | undefined;
        responseStatus?: number | undefined;
    }, {
        endpoint: string;
        validated: boolean;
        payload: string;
        method: string;
        oastCallbacks?: {
            timestamp: string;
            url: string;
            method: string;
            headers: Record<string, string>;
            requestBody?: string | undefined;
        }[] | undefined;
        responseBody?: string | undefined;
        responseStatus?: number | undefined;
    }>>;
    /** Finding ID this PoC validates */
    findingId: z.ZodString;
    /** OAST callbacks captured during exploitation */
    oastCallbacks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        headers: z.ZodRecord<z.ZodString, z.ZodString>;
        method: z.ZodString;
        requestBody: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }, {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }>, "many">>;
    /** Raw sandbox execution logs (verbatim, never LLM-modified) */
    sandboxLogs: z.ZodDefault<z.ZodArray<z.ZodObject<{
        command: z.ZodString;
        durationMs: z.ZodNumber;
        exitCode: z.ZodNumber;
        stderr: z.ZodString;
        stdout: z.ZodString;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        durationMs: number;
        command: string;
        stderr: string;
        stdout: string;
        exitCode: number;
    }, {
        timestamp: string;
        durationMs: number;
        command: string;
        stderr: string;
        stdout: string;
        exitCode: number;
    }>, "many">>;
    /** Schema version */
    schemaVersion: z.ZodDefault<z.ZodString>;
    /** When this PoC was captured */
    timestamp: z.ZodString;
    /** Whether the exploit was successfully validated */
    validated: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    schemaVersion: string;
    timestamp: string;
    validated: boolean;
    oastCallbacks: {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }[];
    findingId: string;
    sandboxLogs: {
        timestamp: string;
        durationMs: number;
        command: string;
        stderr: string;
        stdout: string;
        exitCode: number;
    }[];
    dastResult?: {
        endpoint: string;
        validated: boolean;
        payload: string;
        method: string;
        oastCallbacks: {
            timestamp: string;
            url: string;
            method: string;
            headers: Record<string, string>;
            requestBody?: string | undefined;
        }[];
        responseBody?: string | undefined;
        responseStatus?: number | undefined;
    } | undefined;
}, {
    timestamp: string;
    validated: boolean;
    findingId: string;
    schemaVersion?: string | undefined;
    oastCallbacks?: {
        timestamp: string;
        url: string;
        method: string;
        headers: Record<string, string>;
        requestBody?: string | undefined;
    }[] | undefined;
    dastResult?: {
        endpoint: string;
        validated: boolean;
        payload: string;
        method: string;
        oastCallbacks?: {
            timestamp: string;
            url: string;
            method: string;
            headers: Record<string, string>;
            requestBody?: string | undefined;
        }[] | undefined;
        responseBody?: string | undefined;
        responseStatus?: number | undefined;
    } | undefined;
    sandboxLogs?: {
        timestamp: string;
        durationMs: number;
        command: string;
        stderr: string;
        stdout: string;
        exitCode: number;
    }[] | undefined;
}>;
export type ExploitProofOfConcept = z.infer<typeof exploitProofOfConceptSchema>;
