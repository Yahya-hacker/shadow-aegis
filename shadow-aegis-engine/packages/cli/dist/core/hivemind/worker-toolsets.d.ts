/**
 * Worker Toolsets - Role-scoped tool subsets for swarm workers.
 */
import { type ToolSet } from 'ai';
import { type AgentRole } from './hivemind-schema.js';
/**
 * Filter the global toolset to only include tools appropriate for the given worker role.
 */
export declare function createRoleToolSet(role: AgentRole, allTools: ToolSet): ToolSet;
