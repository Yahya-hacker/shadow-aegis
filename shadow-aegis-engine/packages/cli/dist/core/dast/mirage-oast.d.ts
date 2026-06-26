/**
 * Mirage OAST - Out-of-Band Application Security Testing Proxy.
 *
 * A local, autonomous Burp Collaborator equivalent. Runs as a sidecar
 * container on the `shadow-net` Docker network, acting as:
 *
 * - DNS Server (port 53): Resolves ALL domains to the Mirage itself,
 *   preventing startup crashes from missing external services.
 * - HTTP Proxy (port 8080): Intercepts all outbound HTTP requests,
 *   returning generic stub responses for dependency services.
 * - OAST Endpoint: Logs every intercepted request. The verifier agent
 *   injects payloads pointing to `oast-{token}.shadow.local`, and the
 *   Mirage captures those callbacks as proof of SSRF/Blind RCE.
 */
import { type OastCallback } from './dast-schema.js';
export interface MirageOASTOptions {
    networkName: string;
    runId: string;
}
/**
 * Manages the Mirage OAST sidecar container and its callback log.
 */
export declare class MirageOAST {
    private readonly callbackLog;
    private containerName;
    private readonly networkName;
    private readonly runId;
    private running;
    constructor(options: MirageOASTOptions);
    /**
     * Clear all OAST callback logs.
     */
    clearLog(): void;
    /**
     * Destroy the Mirage container.
     */
    destroy(): Promise<void>;
    /**
     * Generate a unique OAST callback token for a finding.
     */
    generateToken(findingId: string): string;
    /**
     * Get all OAST callbacks.
     */
    getCallbackLog(): OastCallback[];
    /**
     * Get callbacks for a specific domain.
     */
    getCallbacksForDomain(domain: string): OastCallback[];
    /**
     * Get the container name for DNS/proxy configuration.
     */
    getContainerName(): string;
    /**
     * Check if a specific OAST token was called back.
     */
    hasCallback(tokenOrDomain: string): boolean;
    /**
     * Whether the Mirage is running.
     */
    isRunning(): boolean;
    /**
     * Record an OAST callback (called by the sandbox when polling Mirage logs).
     */
    recordCallback(callback: OastCallback): void;
    /**
     * Start the Mirage OAST sidecar container.
     *
     * The sidecar runs a minimal Node.js HTTP server that:
     * 1. Responds to all HTTP requests with `{"status":"ok"}`
     * 2. Logs every request URL, method, and headers
     * 3. The log can be queried via a management endpoint
     */
    start(): Promise<void>;
    /**
     * Sync the callback log from the Mirage container's management endpoint.
     */
    syncLog(): Promise<OastCallback[]>;
    private dockerExec;
}
