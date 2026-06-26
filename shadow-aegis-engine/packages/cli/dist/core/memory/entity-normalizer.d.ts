/**
 * Entity Normalizer - Canonical ID generation and deduplication.
 * Ensures consistent entity identity across the knowledge graph.
 */
import type { BaseEntity, EntityType } from './memory-schema.js';
/**
 * Generate a canonical ID for an entity based on its identifying properties.
 * Same inputs always produce the same ID for deterministic reproducibility.
 */
export declare function generateCanonicalId(entityType: EntityType, identifyingProps: Record<string, unknown>): string;
/**
 * Generate canonical ID for a file entity.
 */
export declare function fileCanonicalId(filePath: string): string;
/**
 * Generate canonical ID for a function entity.
 */
export declare function functionCanonicalId(fileId: string, functionName: string, lineStart: number): string;
/**
 * Generate canonical ID for a sink entity.
 */
export declare function sinkCanonicalId(fileId: string, sinkName: string, lineNumber: number): string;
/**
 * Generate canonical ID for a source entity.
 */
export declare function sourceCanonicalId(fileId: string, sourceName: string, lineNumber: number): string;
/**
 * Generate canonical ID for a vulnerability entity.
 */
export declare function vulnerabilityCanonicalId(cwe: string, sourceId: string | undefined, sinkId: string | undefined, title: string): string;
/**
 * Generate canonical ID for an edge.
 */
export declare function edgeCanonicalId(edgeType: string, sourceEntityId: string, targetEntityId: string): string;
/**
 * Normalize file path for consistent hashing.
 */
export declare function normalizePath(filePath: string): string;
/**
 * Check if two entities are duplicates based on canonical ID.
 */
export declare function isDuplicateEntity(a: BaseEntity, b: BaseEntity): boolean;
/**
 * Merge two entities, preferring the newer one's properties.
 */
export declare function mergeEntities<T extends BaseEntity>(existing: T, incoming: T): T;
/**
 * Compute content hash for code evidence deduplication.
 */
export declare function computeCodeHash(codeSnippet: string): string;
