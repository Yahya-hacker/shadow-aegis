/**
 * Sandbox Manager - Dual-container DAST execution environment.
 *
 * Orchestrates a target container + Mirage OAST sidecar on an internal
 * Docker network (`shadow-net-{runId}`). The target routes all DNS/HTTP
 * through the Mirage, which simulates external services and captures
 * OAST callbacks for exploit validation.
 */
import { type SandboxExecResult } from './dast-schema.js';
import { MirageOAST } from './mirage-oast.js';
export interface SandboxOptions {
    baseImage?: string;
    cpuLimit?: string;
    healthCheckUrl?: string;
    memoryLimit?: string;
    runId: string;
    startCommand?: string;
    targetPath: string;
    timeoutMs?: number;
}
export declare class SandboxManager {
    private readonly containerName;
    private readonly executionLog;
    private readonly mirage;
    private readonly networkName;
    private readonly options;
    private running;
    constructor(options: SandboxOptions);
    /**
     * Create the Docker network and start the Mirage sidecar.
     */
    create(): Promise<void>;
    /**
     * Deploy the target application inside the sandbox.
     */
    deploy(): Promise<string>;
    /**
     * Force-destroy everything: containers, network, volumes.
     * Idempotent and crash-safe.
     */
    destroy(): Promise<void>;
    /**
     * Execute a command inside the sandbox target container.
     */
    exec(command: string): Promise<SandboxExecResult>;
    /**
     * Get the full execution log (used by the report generator for verbatim PoC).
     */
    getExecutionLog(): SandboxExecResult[];
    /**
     * Get the Mirage OAST instance for direct callback queries.
     */
    getMirage(): MirageOAST;
    /**
     * Whether the sandbox is currently running.
     */
    isRunning(): boolean;
    /**
     * Get sandbox status.
     */
    status(): Promise<{
        containerRunning: boolean;
        mirageRunning: boolean;
        networkName: string;
        oastCallbackCount: number;
    }>;
    private dockerExec;
    private shellEscape;
}
