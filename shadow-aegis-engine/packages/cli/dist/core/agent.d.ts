import type { ShadowConfig } from '../utils/config.js';
import { type StreamActivity } from './session.js';
export interface AgentSessionOptions {
    /** Diff scope hint from incremental mode (pre-built string) */
    diffScopeHint?: string;
    expertUnsafe?: boolean;
}
export interface AgentStreamEvent {
    kind: 'status' | StreamActivity['kind'];
    message: string;
    timestamp: string;
    toolCallId?: string;
    toolName?: string;
}
export declare class AgentSession {
    private readonly config;
    private readonly targetPath;
    private artifacts;
    private diffScopeHint;
    private expertUnsafe;
    private initialized;
    private mcpManager;
    private messages;
    private missionEngine;
    private model;
    private runtime;
    private runtimeWarnings;
    private semanticIndex;
    private systemPrompt;
    private tools;
    constructor(config: ShadowConfig, repoMap: string, targetPath: string, options?: AgentSessionOptions);
    sendMessage(userMessage: string, onChunk: (text: string) => void, onEvent?: (event: AgentStreamEvent) => void): Promise<string>;
    private completeMissionCycle;
    private createEmbeddingProvider;
    private ingestReportFindings;
    private initialize;
    private initializeMcpTools;
    private initializeMissionRuntime;
    private initializeSemanticIndex;
    private isMcpEnabled;
    private persistMessages;
    private persistToolEvents;
    private startMissionCycle;
    private transitionMission;
}
