/**
 * Knowledge Graph - Graph-native entity and relationship storage.
 * Supports deterministic deduplication, typed edges, and traversal queries.
 */
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { err, ok } from '../schema/base.js';
import { edgeCanonicalId, mergeEntities } from './entity-normalizer.js';
import { graphEdgeSchema, knowledgeGraphStateSchema, } from './memory-schema.js';
/**
 * In-memory knowledge graph with persistence.
 * Enforces deduplication and schema validation on all operations.
 */
export class KnowledgeGraph {
    edges = new Map();
    entities = new Map();
    entitiesByType = new Map();
    // Indexes for efficient traversal
    inboundEdges = new Map(); // targetId -> edgeIds
    outboundEdges = new Map(); // sourceId -> edgeIds
    runId;
    snapshotPath;
    constructor(options) {
        this.runId = options.runId;
        this.snapshotPath = path.join(options.storagePath, 'knowledge-graph.json');
    }
    /**
     * Create or load a knowledge graph.
     */
    static async create(options) {
        await fs.mkdir(options.storagePath, { recursive: true });
        const graph = new KnowledgeGraph(options);
        await graph.loadSnapshot();
        return graph;
    }
    /**
     * Add an edge between entities.
     * Returns error if source or target entity doesn't exist.
     */
    addEdge(edgeType, sourceEntityId, targetEntityId, options = {}) {
        // Validate entities exist
        if (!this.entities.has(sourceEntityId)) {
            return err(`Source entity not found: ${sourceEntityId}`);
        }
        if (!this.entities.has(targetEntityId)) {
            return err(`Target entity not found: ${targetEntityId}`);
        }
        const edgeId = edgeCanonicalId(edgeType, sourceEntityId, targetEntityId);
        // Check for existing edge
        const existing = this.edges.get(edgeId);
        if (existing) {
            // Update existing edge with higher confidence
            const updated = {
                ...existing,
                confidence: Math.max(existing.confidence, options.confidence ?? 0.5),
                metadata: { ...existing.metadata, ...options.metadata },
                validated: existing.validated || (options.validated ?? false),
            };
            this.edges.set(edgeId, updated);
            return ok(updated);
        }
        // Create new edge
        const edge = {
            confidence: options.confidence ?? 0.5,
            createdAt: new Date().toISOString(),
            edgeId,
            edgeType,
            metadata: options.metadata ?? {},
            sourceEntityId,
            targetEntityId,
            validated: options.validated ?? false,
        };
        // Validate schema
        const validation = graphEdgeSchema.safeParse(edge);
        if (!validation.success) {
            return err(`Edge validation failed: ${validation.error.message}`);
        }
        this.edges.set(edgeId, edge);
        this.indexEdge(edge);
        return ok(edge);
    }
    /**
     * Add or merge an entity.
     * Returns true if this was a new entity, false if merged with existing.
     */
    addEntity(entity) {
        const existing = this.entities.get(entity.canonicalId);
        if (existing) {
            // Merge with existing entity
            const merged = mergeEntities(existing, entity);
            this.entities.set(entity.canonicalId, merged);
            return { entity: merged, isNew: false };
        }
        // New entity
        this.entities.set(entity.canonicalId, entity);
        this.indexEntityByType(entity);
        return { entity, isNew: true };
    }
    /**
     * Find paths between two entities.
     */
    findPaths(sourceId, targetId, maxDepth = 5) {
        const paths = [];
        const visited = new Set();
        const dfs = (currentId, currentPath, currentEdges, depth) => {
            if (depth > maxDepth)
                return;
            if (currentId === targetId) {
                paths.push({
                    edges: [...currentEdges],
                    entities: [...currentPath],
                });
                return;
            }
            visited.add(currentId);
            for (const edge of this.getOutboundEdges(currentId)) {
                const nextId = edge.targetEntityId;
                if (!visited.has(nextId)) {
                    const nextEntity = this.entities.get(nextId);
                    if (nextEntity) {
                        dfs(nextId, [...currentPath, nextEntity], [...currentEdges, edge], depth + 1);
                    }
                }
            }
            visited.delete(currentId);
        };
        const startEntity = this.entities.get(sourceId);
        if (startEntity) {
            dfs(sourceId, [startEntity], [], 0);
        }
        return paths;
    }
    /**
     * Get an edge by ID.
     */
    getEdge(edgeId) {
        return this.edges.get(edgeId);
    }
    /**
     * Get all entities of a specific type.
     */
    getEntitiesByType(entityType) {
        const ids = this.entitiesByType.get(entityType);
        if (!ids)
            return [];
        return [...ids].map((id) => this.entities.get(id)).filter(Boolean);
    }
    /**
     * Get an entity by canonical ID.
     */
    getEntity(canonicalId) {
        return this.entities.get(canonicalId);
    }
    /**
     * Get all edges to a target entity.
     */
    getInboundEdges(targetEntityId, edgeType) {
        const edgeIds = this.inboundEdges.get(targetEntityId);
        if (!edgeIds)
            return [];
        return [...edgeIds]
            .map((id) => this.edges.get(id))
            .filter((e) => e && (!edgeType || e.edgeType === edgeType));
    }
    /**
     * Get all edges from a source entity.
     */
    getOutboundEdges(sourceEntityId, edgeType) {
        const edgeIds = this.outboundEdges.get(sourceEntityId);
        if (!edgeIds)
            return [];
        return [...edgeIds]
            .map((id) => this.edges.get(id))
            .filter((e) => e && (!edgeType || e.edgeType === edgeType));
    }
    /**
     * Query entities matching criteria.
     */
    query(criteria) {
        let candidates = [...this.entities.values()];
        if (criteria.entityType) {
            candidates = candidates.filter((e) => e.entityType === criteria.entityType);
        }
        if (criteria.minConfidence !== undefined) {
            candidates = candidates.filter((e) => e.confidence >= criteria.minConfidence);
        }
        if (criteria.labelContains) {
            const search = criteria.labelContains.toLowerCase();
            candidates = candidates.filter((e) => e.label.toLowerCase().includes(search));
        }
        if (criteria.propertyMatches) {
            candidates = candidates.filter((e) => {
                for (const [key, value] of Object.entries(criteria.propertyMatches)) {
                    if (e.properties[key] !== value) {
                        return false;
                    }
                }
                return true;
            });
        }
        return candidates;
    }
    /**
     * Save graph to disk.
     */
    async saveSnapshot() {
        const state = {
            edges: Object.fromEntries(this.edges),
            entities: Object.fromEntries(this.entities),
            runId: this.runId,
            schemaVersion: '1.0.0',
            snapshotAt: new Date().toISOString(),
        };
        const validation = knowledgeGraphStateSchema.safeParse(state);
        if (!validation.success) {
            throw new Error(`Invalid graph state: ${validation.error.message}`);
        }
        await fs.writeFile(this.snapshotPath, JSON.stringify(state, null, 2), 'utf8');
    }
    /**
     * Get graph statistics.
     */
    stats() {
        const entitiesByType = {};
        for (const [type, ids] of this.entitiesByType) {
            entitiesByType[type] = ids.size;
        }
        const edgesByType = {};
        for (const edge of this.edges.values()) {
            edgesByType[edge.edgeType] = (edgesByType[edge.edgeType] ?? 0) + 1;
        }
        return {
            edgeCount: this.edges.size,
            edgesByType,
            entitiesByType,
            entityCount: this.entities.size,
        };
    }
    /**
     * Traverse the graph from a starting entity.
     */
    traverse(startEntityId, options = {}) {
        const visited = new Set();
        const result = [];
        const queue = [{ depth: 0, entityId: startEntityId }];
        const maxDepth = options.maxDepth ?? 3;
        const minConfidence = options.minConfidence ?? 0;
        const direction = options.direction ?? 'outbound';
        while (queue.length > 0) {
            const { depth, entityId } = queue.shift();
            if (visited.has(entityId) || depth > maxDepth)
                continue;
            visited.add(entityId);
            const entity = this.entities.get(entityId);
            if (entity && entity.confidence >= minConfidence) {
                result.push(entity);
            }
            // Get adjacent entities
            const adjacentEdges = [];
            if (direction === 'outbound' || direction === 'both') {
                adjacentEdges.push(...this.getOutboundEdges(entityId));
            }
            if (direction === 'inbound' || direction === 'both') {
                adjacentEdges.push(...this.getInboundEdges(entityId));
            }
            for (const edge of adjacentEdges) {
                if (options.edgeTypes && !options.edgeTypes.includes(edge.edgeType))
                    continue;
                if (edge.confidence < minConfidence)
                    continue;
                const nextEntityId = edge.sourceEntityId === entityId ? edge.targetEntityId : edge.sourceEntityId;
                if (!visited.has(nextEntityId)) {
                    queue.push({ depth: depth + 1, entityId: nextEntityId });
                }
            }
        }
        return result;
    }
    indexEdge(edge) {
        // Index outbound
        const outbound = this.outboundEdges.get(edge.sourceEntityId) ?? new Set();
        outbound.add(edge.edgeId);
        this.outboundEdges.set(edge.sourceEntityId, outbound);
        // Index inbound
        const inbound = this.inboundEdges.get(edge.targetEntityId) ?? new Set();
        inbound.add(edge.edgeId);
        this.inboundEdges.set(edge.targetEntityId, inbound);
    }
    indexEntityByType(entity) {
        const typeSet = this.entitiesByType.get(entity.entityType) ?? new Set();
        typeSet.add(entity.canonicalId);
        this.entitiesByType.set(entity.entityType, typeSet);
    }
    /**
     * Load graph from disk.
     */
    async loadSnapshot() {
        try {
            const content = await fs.readFile(this.snapshotPath, 'utf8');
            const parsed = JSON.parse(content);
            const validation = knowledgeGraphStateSchema.safeParse(parsed);
            if (!validation.success) {
                console.warn('[KnowledgeGraph] Invalid snapshot, starting fresh:', validation.error.message);
                return;
            }
            const state = validation.data;
            // Restore entities
            for (const [id, entity] of Object.entries(state.entities)) {
                this.entities.set(id, entity);
                this.indexEntityByType(entity);
            }
            // Restore edges
            for (const [id, edge] of Object.entries(state.edges)) {
                this.edges.set(id, edge);
                this.indexEdge(edge);
            }
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                return;
            }
            throw error;
        }
    }
}
