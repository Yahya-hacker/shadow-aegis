import { type ToolSet } from 'ai';
import type { MCPAdapter } from './types.js';
export interface MCPManagerOptions {
    expertUnsafe: boolean;
    targetPath: string;
}
export interface MCPDiscoveredCapability {
    adapterId: string;
    available: boolean;
    capabilities: string[];
    displayName: string;
    tools: string[];
}
export declare class MCPManager {
    private readonly options;
    private readonly adapters;
    constructor(options: MCPManagerOptions);
    buildAgentTools(): ToolSet;
    discoverCapabilities(): MCPDiscoveredCapability[];
    initialize(): Promise<void>;
    registerAdapter(adapter: MCPAdapter): void;
    shutdown(): Promise<void>;
    private wrapTool;
}
