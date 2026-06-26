/**
 * Planner Schemas - Typed contracts for attack chain planning.
 */
import { z } from 'zod';
export declare const attackStepStatusSchema: z.ZodEnum<["hypothesized", "investigating", "verified", "rejected", "blocked"]>;
export type AttackStepStatus = z.infer<typeof attackStepStatusSchema>;
export declare const attackCategorySchema: z.ZodEnum<["injection", "broken_auth", "sensitive_data", "xxe", "access_control", "security_misconfig", "xss", "deserialization", "components", "logging", "ssrf", "other"]>;
export type AttackCategory = z.infer<typeof attackCategorySchema>;
/**
 * A single step in an attack chain.
 */
export declare const attackStepSchema: z.ZodObject<{
    attackCategory: z.ZodEnum<["injection", "broken_auth", "sensitive_data", "xxe", "access_control", "security_misconfig", "xss", "deserialization", "components", "logging", "ssrf", "other"]>;
    confidence: z.ZodNumber;
    createdAt: z.ZodString;
    cwe: z.ZodString;
    description: z.ZodString;
    entityIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    feasibility: z.ZodNumber;
    impact: z.ZodNumber;
    prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodEnum<["hypothesized", "investigating", "verified", "rejected", "blocked"]>;
    stepId: z.ZodString;
    title: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "blocked" | "investigating" | "verified" | "rejected" | "hypothesized";
    description: string;
    createdAt: string;
    updatedAt: string;
    confidence: number;
    evidenceIds: string[];
    cwe: string;
    title: string;
    impact: number;
    attackCategory: "other" | "injection" | "broken_auth" | "sensitive_data" | "xxe" | "access_control" | "security_misconfig" | "xss" | "deserialization" | "components" | "logging" | "ssrf";
    entityIds: string[];
    feasibility: number;
    prerequisites: string[];
    stepId: string;
}, {
    status: "blocked" | "investigating" | "verified" | "rejected" | "hypothesized";
    description: string;
    createdAt: string;
    updatedAt: string;
    confidence: number;
    cwe: string;
    title: string;
    impact: number;
    attackCategory: "other" | "injection" | "broken_auth" | "sensitive_data" | "xxe" | "access_control" | "security_misconfig" | "xss" | "deserialization" | "components" | "logging" | "ssrf";
    feasibility: number;
    stepId: string;
    evidenceIds?: string[] | undefined;
    entityIds?: string[] | undefined;
    prerequisites?: string[] | undefined;
}>;
export type AttackStep = z.infer<typeof attackStepSchema>;
export declare const chainStatusSchema: z.ZodEnum<["hypothesized", "investigating", "verified", "rejected", "partial"]>;
export type ChainStatus = z.infer<typeof chainStatusSchema>;
/**
 * An ordered sequence of attack steps forming an attack chain.
 */
export declare const attackChainSchema: z.ZodObject<{
    chainId: z.ZodString;
    createdAt: z.ZodString;
    description: z.ZodString;
    evidenceDensity: z.ZodNumber;
    feasibility: z.ZodNumber;
    impact: z.ZodNumber;
    score: z.ZodNumber;
    status: z.ZodEnum<["hypothesized", "investigating", "verified", "rejected", "partial"]>;
    steps: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "investigating" | "verified" | "rejected" | "hypothesized" | "partial";
    description: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    steps: string[];
    impact: number;
    feasibility: number;
    chainId: string;
    evidenceDensity: number;
    score: number;
}, {
    status: "investigating" | "verified" | "rejected" | "hypothesized" | "partial";
    description: string;
    createdAt: string;
    updatedAt: string;
    title: string;
    steps: string[];
    impact: number;
    feasibility: number;
    chainId: string;
    evidenceDensity: number;
    score: number;
}>;
export type AttackChain = z.infer<typeof attackChainSchema>;
export declare const plannerActionTypeSchema: z.ZodEnum<["verify_step", "explore_path", "collect_evidence", "test_exploit", "find_sources", "find_sinks", "trace_flow", "analyze_code"]>;
export type PlannerActionType = z.infer<typeof plannerActionTypeSchema>;
/**
 * A planned action recommended by the planner.
 */
export declare const plannerActionSchema: z.ZodObject<{
    actionId: z.ZodString;
    actionType: z.ZodEnum<["verify_step", "explore_path", "collect_evidence", "test_exploit", "find_sources", "find_sinks", "trace_flow", "analyze_code"]>;
    estimatedValue: z.ZodNumber;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    priority: z.ZodNumber;
    rationale: z.ZodString;
    targetStepId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    priority: number;
    actionId: string;
    parameters: Record<string, unknown>;
    rationale: string;
    actionType: "verify_step" | "explore_path" | "collect_evidence" | "test_exploit" | "find_sources" | "find_sinks" | "trace_flow" | "analyze_code";
    estimatedValue: number;
    targetStepId?: string | undefined;
}, {
    priority: number;
    actionId: string;
    parameters: Record<string, unknown>;
    rationale: string;
    actionType: "verify_step" | "explore_path" | "collect_evidence" | "test_exploit" | "find_sources" | "find_sinks" | "trace_flow" | "analyze_code";
    estimatedValue: number;
    targetStepId?: string | undefined;
}>;
export type PlannerAction = z.infer<typeof plannerActionSchema>;
export declare const plannerStateSchema: z.ZodObject<{
    chains: z.ZodDefault<z.ZodArray<z.ZodObject<{
        chainId: z.ZodString;
        createdAt: z.ZodString;
        description: z.ZodString;
        evidenceDensity: z.ZodNumber;
        feasibility: z.ZodNumber;
        impact: z.ZodNumber;
        score: z.ZodNumber;
        status: z.ZodEnum<["hypothesized", "investigating", "verified", "rejected", "partial"]>;
        steps: z.ZodArray<z.ZodString, "many">;
        title: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "investigating" | "verified" | "rejected" | "hypothesized" | "partial";
        description: string;
        createdAt: string;
        updatedAt: string;
        title: string;
        steps: string[];
        impact: number;
        feasibility: number;
        chainId: string;
        evidenceDensity: number;
        score: number;
    }, {
        status: "investigating" | "verified" | "rejected" | "hypothesized" | "partial";
        description: string;
        createdAt: string;
        updatedAt: string;
        title: string;
        steps: string[];
        impact: number;
        feasibility: number;
        chainId: string;
        evidenceDensity: number;
        score: number;
    }>, "many">>;
    currentFocus: z.ZodOptional<z.ZodString>;
    lastUpdatedAt: z.ZodString;
    pendingActions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        actionId: z.ZodString;
        actionType: z.ZodEnum<["verify_step", "explore_path", "collect_evidence", "test_exploit", "find_sources", "find_sinks", "trace_flow", "analyze_code"]>;
        estimatedValue: z.ZodNumber;
        parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        priority: z.ZodNumber;
        rationale: z.ZodString;
        targetStepId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        priority: number;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        actionType: "verify_step" | "explore_path" | "collect_evidence" | "test_exploit" | "find_sources" | "find_sinks" | "trace_flow" | "analyze_code";
        estimatedValue: number;
        targetStepId?: string | undefined;
    }, {
        priority: number;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        actionType: "verify_step" | "explore_path" | "collect_evidence" | "test_exploit" | "find_sources" | "find_sinks" | "trace_flow" | "analyze_code";
        estimatedValue: number;
        targetStepId?: string | undefined;
    }>, "many">>;
    runId: z.ZodString;
    steps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        attackCategory: z.ZodEnum<["injection", "broken_auth", "sensitive_data", "xxe", "access_control", "security_misconfig", "xss", "deserialization", "components", "logging", "ssrf", "other"]>;
        confidence: z.ZodNumber;
        createdAt: z.ZodString;
        cwe: z.ZodString;
        description: z.ZodString;
        entityIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        evidenceIds: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        feasibility: z.ZodNumber;
        impact: z.ZodNumber;
        prerequisites: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        status: z.ZodEnum<["hypothesized", "investigating", "verified", "rejected", "blocked"]>;
        stepId: z.ZodString;
        title: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        status: "blocked" | "investigating" | "verified" | "rejected" | "hypothesized";
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        evidenceIds: string[];
        cwe: string;
        title: string;
        impact: number;
        attackCategory: "other" | "injection" | "broken_auth" | "sensitive_data" | "xxe" | "access_control" | "security_misconfig" | "xss" | "deserialization" | "components" | "logging" | "ssrf";
        entityIds: string[];
        feasibility: number;
        prerequisites: string[];
        stepId: string;
    }, {
        status: "blocked" | "investigating" | "verified" | "rejected" | "hypothesized";
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        cwe: string;
        title: string;
        impact: number;
        attackCategory: "other" | "injection" | "broken_auth" | "sensitive_data" | "xxe" | "access_control" | "security_misconfig" | "xss" | "deserialization" | "components" | "logging" | "ssrf";
        feasibility: number;
        stepId: string;
        evidenceIds?: string[] | undefined;
        entityIds?: string[] | undefined;
        prerequisites?: string[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    pendingActions: {
        priority: number;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        actionType: "verify_step" | "explore_path" | "collect_evidence" | "test_exploit" | "find_sources" | "find_sinks" | "trace_flow" | "analyze_code";
        estimatedValue: number;
        targetStepId?: string | undefined;
    }[];
    runId: string;
    steps: {
        status: "blocked" | "investigating" | "verified" | "rejected" | "hypothesized";
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        evidenceIds: string[];
        cwe: string;
        title: string;
        impact: number;
        attackCategory: "other" | "injection" | "broken_auth" | "sensitive_data" | "xxe" | "access_control" | "security_misconfig" | "xss" | "deserialization" | "components" | "logging" | "ssrf";
        entityIds: string[];
        feasibility: number;
        prerequisites: string[];
        stepId: string;
    }[];
    lastUpdatedAt: string;
    chains: {
        status: "investigating" | "verified" | "rejected" | "hypothesized" | "partial";
        description: string;
        createdAt: string;
        updatedAt: string;
        title: string;
        steps: string[];
        impact: number;
        feasibility: number;
        chainId: string;
        evidenceDensity: number;
        score: number;
    }[];
    currentFocus?: string | undefined;
}, {
    runId: string;
    lastUpdatedAt: string;
    pendingActions?: {
        priority: number;
        actionId: string;
        parameters: Record<string, unknown>;
        rationale: string;
        actionType: "verify_step" | "explore_path" | "collect_evidence" | "test_exploit" | "find_sources" | "find_sinks" | "trace_flow" | "analyze_code";
        estimatedValue: number;
        targetStepId?: string | undefined;
    }[] | undefined;
    steps?: {
        status: "blocked" | "investigating" | "verified" | "rejected" | "hypothesized";
        description: string;
        createdAt: string;
        updatedAt: string;
        confidence: number;
        cwe: string;
        title: string;
        impact: number;
        attackCategory: "other" | "injection" | "broken_auth" | "sensitive_data" | "xxe" | "access_control" | "security_misconfig" | "xss" | "deserialization" | "components" | "logging" | "ssrf";
        feasibility: number;
        stepId: string;
        evidenceIds?: string[] | undefined;
        entityIds?: string[] | undefined;
        prerequisites?: string[] | undefined;
    }[] | undefined;
    chains?: {
        status: "investigating" | "verified" | "rejected" | "hypothesized" | "partial";
        description: string;
        createdAt: string;
        updatedAt: string;
        title: string;
        steps: string[];
        impact: number;
        feasibility: number;
        chainId: string;
        evidenceDensity: number;
        score: number;
    }[] | undefined;
    currentFocus?: string | undefined;
}>;
export type PlannerState = z.infer<typeof plannerStateSchema>;
export interface ChainRankingWeights {
    evidenceDensity: number;
    feasibility: number;
    impact: number;
}
export declare const DEFAULT_RANKING_WEIGHTS: ChainRankingWeights;
/**
 * Calculate chain ranking score.
 */
export declare function calculateChainScore(chain: Pick<AttackChain, 'evidenceDensity' | 'feasibility' | 'impact'>, weights?: ChainRankingWeights): number;
