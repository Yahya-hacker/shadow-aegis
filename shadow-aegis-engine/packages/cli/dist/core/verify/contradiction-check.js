/**
 * Contradiction Check - Detect conflicting evidence.
 */
/**
 * Checks for contradictory evidence in the knowledge graph.
 */
export class ContradictionChecker {
    graph;
    constructor(graph) {
        this.graph = graph;
    }
    /**
     * Check for contradictions related to a finding.
     */
    checkFinding(findingTitle, sourceId, sinkId, relatedEntityIds = []) {
        const contradictions = [];
        const recommendations = [];
        // Check for conflicting vulnerability status
        const statusContradictions = this.checkConflictingStatus(relatedEntityIds);
        contradictions.push(...statusContradictions);
        // Check data flow validity
        if (sourceId && sinkId) {
            const flowContradictions = this.checkDataFlowValidity(sourceId, sinkId);
            contradictions.push(...flowContradictions);
        }
        // Check for duplicate findings
        const duplicates = this.checkDuplicateFindings(findingTitle, relatedEntityIds);
        contradictions.push(...duplicates);
        // Check confidence consistency
        const confidenceIssues = this.checkConfidenceConsistency(relatedEntityIds);
        contradictions.push(...confidenceIssues);
        // Generate recommendations
        for (const c of contradictions) {
            switch (c.type) {
                case 'confidence_mismatch': {
                    recommendations.push('Gather additional evidence to resolve confidence discrepancy');
                    break;
                }
                case 'conflicting_status': {
                    recommendations.push(`Re-verify status of entities: ${c.entityIds.join(', ')}`);
                    break;
                }
                case 'duplicate_finding': {
                    recommendations.push('Consolidate duplicate findings');
                    break;
                }
                case 'impossible_flow': {
                    recommendations.push('Verify data flow path exists and is reachable');
                    break;
                }
            }
        }
        const hasBlockingContradictions = contradictions.some((c) => c.severity === 'critical' || c.severity === 'major');
        return {
            contradictions,
            hasBlockingContradictions,
            recommendations,
        };
    }
    /**
     * Check confidence consistency.
     */
    checkConfidenceConsistency(entityIds) {
        const contradictions = [];
        for (const entityId of entityIds) {
            const entity = this.graph.getEntity(entityId);
            if (!entity)
                continue;
            // High confidence entity with low confidence edges
            if (entity.confidence >= 0.8) {
                const edges = [
                    ...this.graph.getInboundEdges(entityId),
                    ...this.graph.getOutboundEdges(entityId),
                ];
                const lowConfidenceEdges = edges.filter((e) => e.confidence < 0.5);
                if (lowConfidenceEdges.length > edges.length / 2) {
                    contradictions.push({
                        description: `High confidence entity ${entityId} has mostly low confidence relationships`,
                        entityIds: [entityId],
                        severity: 'minor',
                        type: 'confidence_mismatch',
                    });
                }
            }
        }
        return contradictions;
    }
    /**
     * Check for conflicting vulnerability status.
     */
    checkConflictingStatus(entityIds) {
        const contradictions = [];
        for (const entityId of entityIds) {
            const entity = this.graph.getEntity(entityId);
            if (!entity)
                continue;
            // Check if entity has contradictory edges
            const inbound = this.graph.getInboundEdges(entityId);
            const outbound = this.graph.getOutboundEdges(entityId);
            const hasVulnerableEdge = [...inbound, ...outbound].some((e) => e.edgeType === 'exploits' || e.metadata.vulnerable === true);
            const hasSafeEdge = [...inbound, ...outbound].some((e) => e.edgeType === 'guards' || e.metadata.safe === true);
            if (hasVulnerableEdge && hasSafeEdge) {
                contradictions.push({
                    description: `Entity ${entityId} marked as both vulnerable and protected`,
                    entityIds: [entityId],
                    severity: 'major',
                    type: 'conflicting_status',
                });
            }
        }
        return contradictions;
    }
    /**
     * Check data flow validity.
     */
    checkDataFlowValidity(sourceId, sinkId) {
        const contradictions = [];
        const source = this.graph.getEntity(sourceId);
        const sink = this.graph.getEntity(sinkId);
        if (!source || !sink) {
            return contradictions;
        }
        // Check if source and sink are in compatible contexts
        const sourceProps = source.properties;
        const sinkProps = sink.properties;
        // Example: Check if they're in different files without a call path
        if (sourceProps.fileCanonicalId !== sinkProps.fileCanonicalId) {
            // Check if there's a path between them
            const paths = this.graph.findPaths(sourceId, sinkId, 10);
            if (paths.length === 0) {
                // Check for cross-file call edges
                const sourceFile = this.graph.getEntity(sourceProps.fileCanonicalId);
                const sinkFile = this.graph.getEntity(sinkProps.fileCanonicalId);
                if (sourceFile && sinkFile) {
                    // Look for import/call relationships
                    const hasCrossFileConnection = this.hasCrossFileConnection(sourceProps.fileCanonicalId, sinkProps.fileCanonicalId);
                    if (!hasCrossFileConnection) {
                        contradictions.push({
                            description: `Data flow claimed between ${sourceId} and ${sinkId} but no path exists in graph`,
                            entityIds: [sourceId, sinkId],
                            severity: 'major',
                            type: 'impossible_flow',
                        });
                    }
                }
            }
        }
        return contradictions;
    }
    /**
     * Check for duplicate findings.
     */
    checkDuplicateFindings(title, entityIds) {
        const contradictions = [];
        // Find vulnerability entities with similar titles
        const vulnEntities = this.graph.getEntitiesByType('vulnerability');
        const titleLower = title.toLowerCase();
        const similar = vulnEntities.filter((v) => {
            const vTitle = (v.properties.title ?? '').toLowerCase();
            return vTitle !== titleLower && this.isSimilarTitle(titleLower, vTitle);
        });
        if (similar.length > 0) {
            contradictions.push({
                description: `Potential duplicate findings detected: ${similar.map((s) => s.canonicalId).join(', ')}`,
                entityIds: [similar[0].canonicalId, ...entityIds],
                severity: 'minor',
                type: 'duplicate_finding',
            });
        }
        return contradictions;
    }
    /**
     * Check if two files have a connection (import/call).
     */
    hasCrossFileConnection(fileId1, fileId2) {
        // Get all functions in each file
        const functions1 = this.graph.query({
            entityType: 'function',
            propertyMatches: { fileCanonicalId: fileId1 },
        });
        const functions2 = this.graph.query({
            entityType: 'function',
            propertyMatches: { fileCanonicalId: fileId2 },
        });
        // Check for call edges between functions
        for (const f1 of functions1) {
            const outbound = this.graph.getOutboundEdges(f1.canonicalId, 'calls');
            for (const edge of outbound) {
                if (functions2.some((f2) => f2.canonicalId === edge.targetEntityId)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Simple title similarity check.
     */
    isSimilarTitle(a, b) {
        // Simple word overlap check
        const wordsA = new Set(a.split(/\s+/));
        const wordsB = new Set(b.split(/\s+/));
        let overlap = 0;
        for (const word of wordsA) {
            if (wordsB.has(word))
                overlap++;
        }
        const minSize = Math.min(wordsA.size, wordsB.size);
        return minSize > 0 && overlap / minSize >= 0.7;
    }
}
