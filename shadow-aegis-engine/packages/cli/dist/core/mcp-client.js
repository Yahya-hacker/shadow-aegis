import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from 'events';
export class MCPClient extends EventEmitter {
    pythonPath;
    child = null;
    buffer = '';
    requestId = 0;
    constructor(pythonPath = 'python3') {
        super();
        this.pythonPath = pythonPath;
    }
    /**
     * Spawns the MCP server and sets up the stdio bridge.
     */
    async connect() {
        const serverPath = path.resolve('/workspaces/shadow-aegis/shadow-aegis-engine/packages/core-engine/mcp_server.py');
        if (!fs.existsSync(serverPath)) {
            throw new Error(`MCP Server not found at ${serverPath}`);
        }
        this.child = spawn(this.pythonPath, [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: { ...process.env, PYTHONUNBUFFERED: '1' },
        });
        this.child.stdout?.on('data', (data) => {
            this.handleData(data.toString());
        });
        this.child.stderr?.on('data', (data) => {
            // Pipe server logs to the main process stderr
            process.stderr.write(`[MCP Server]: ${data}`);
        });
        this.child.on('exit', (code) => {
            this.emit('exit', code);
            this.child = null;
        });
        // Initialize the MCP connection
        await this.sendRequest('initialize', {});
    }
    /**
     * Handles incoming data from the Python process using a chunked-buffer accumulator.
     */
    handleData(data) {
        this.buffer += data;
        const lines = this.buffer.split('\n');
        // Keep the last partial line in the buffer
        this.buffer = lines.pop() || '';
        for (const line of lines) {
            if (!line.trim())
                continue;
            try {
                const parsed = JSON.parse(line);
                // If it's a JSON-RPC response, emit it
                if (parsed.jsonrpc === '2.0') {
                    this.emit('response', parsed);
                }
                // If it's a streamed token (thought/action), emit it
                else if (parsed.type === 'thought' || parsed.type === 'action') {
                    this.emit('token', parsed);
                }
            }
            catch (e) {
                // Ignore non-JSON lines (should be minimal if server is correct)
                this.emit('error', new Error(`Failed to parse MCP line: ${line}`));
            }
        }
    }
    /**
     * Sends a JSON-RPC 2.0 request to the server.
     */
    async sendRequest(method, params) {
        return new Promise((resolve, reject) => {
            const id = ++this.requestId;
            const request = {
                jsonrpc: '2.0',
                method,
                params,
                id,
            };
            this.child?.stdin?.write(JSON.stringify(request) + '\n');
            const responseHandler = (response) => {
                if (response.id === id) {
                    this.off('response', responseHandler);
                    resolve(response);
                }
            };
            this.on('response', responseHandler);
            // Timeout to prevent hanging
            setTimeout(() => {
                this.off('response', responseHandler);
                reject(new Error(`Request ${method} timed out after 30s`));
            }, 30000);
        });
    }
    /**
     * Starts an autonomous audit via the MCP server.
     */
    async startAutonomousAudit(repoMap, apiKeys) {
        const response = await this.sendRequest('start_autonomous_audit', {
            repo_map: repoMap,
            api_keys: apiKeys,
        });
        if (response.error) {
            throw new Error(`MCP Audit Error: ${JSON.stringify(response.error)}`);
        }
        return response.result.audit_id;
    }
    /**
     * Gracefully shuts down the MCP server.
     */
    async disconnect() {
        if (this.child) {
            this.child.kill('SIGTERM');
            this.child = null;
        }
    }
}
