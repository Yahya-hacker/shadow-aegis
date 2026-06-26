import type { SecurityReport } from './output/report-schema.js';
export interface SessionMetadata {
    completedAt?: string;
    maxOutputTokens: number;
    maxToolSteps: number;
    mcpEnabled: boolean;
    model: string;
    provider: string;
    runId: string;
    startedAt: string;
    targetPath: string;
    warnings: string[];
}
export interface MessageArtifactEvent {
    content: unknown;
    role: 'assistant' | 'system' | 'tool' | 'user';
    timestamp: string;
}
export interface ToolArtifactEvent {
    data: unknown;
    event: 'call' | 'result';
    timestamp: string;
    toolCallId: string;
    toolName: string;
}
export declare class RunArtifacts {
    private readonly runDirectory;
    private readonly messagesPath;
    private meta;
    private readonly metaPath;
    private readonly reportJsonPath;
    private readonly reportMarkdownPath;
    private readonly reportSarifPath;
    private readonly toolEventsPath;
    private constructor();
    static create(basePath: string, initialMeta: Omit<SessionMetadata, 'runId' | 'startedAt'>): Promise<RunArtifacts>;
    getRunDirectory(): string;
    markCompleted(): Promise<void>;
    recordMessage(event: MessageArtifactEvent): Promise<void>;
    recordToolEvent(event: ToolArtifactEvent): Promise<void>;
    updateMeta(partial: Partial<SessionMetadata>): Promise<void>;
    writeReportJson(report: SecurityReport): Promise<void>;
    writeReportMarkdown(markdown: string): Promise<void>;
    writeReportSarif(sarif: Record<string, unknown>): Promise<void>;
    private writeMeta;
}
