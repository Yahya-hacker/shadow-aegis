import { EventEmitter } from 'events';
export interface MCPToken {
    type: 'thought' | 'action';
    content: string;
}
export interface MCPResponse {
    jsonrpc: string;
    result?: any;
    error?: any;
    id?: string | number;
}
export declare class MCPClient extends EventEmitter {
    private pythonPath;
    private child;
    private buffer;
    private requestId;
    constructor(pythonPath?: string);
    /**
     * Spawns the MCP server and sets up the stdio bridge.
     */
    connect(): Promise<void>;
    /**
     * Handles incoming data from the Python process using a chunked-buffer accumulator.
     */
    private handleData;
    /**
     * Sends a JSON-RPC 2.0 request to the server.
     */
    sendRequest(method: string, params: any): Promise<MCPResponse>;
    /**
     * Starts an autonomous audit via the MCP server.
     */
    startAutonomousAudit(repoMap: any, apiKeys: any): Promise<string>;
    /**
     * Gracefully shuts down the MCP server.
     */
    disconnect(): Promise<void>;
}
