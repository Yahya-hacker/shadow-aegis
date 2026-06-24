import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
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

export class MCPClient extends EventEmitter {
  private child: ChildProcess | null = null;
  private buffer: string = '';
  private requestId = 0;

  constructor(private pythonPath: string = 'python3') {}

  /**
   * Spawns the MCP server and sets up the stdio bridge.
   */
  async connect(): Promise<void> {
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
  private handleData(data: string): void {
    this.buffer += data;
    const lines = this.buffer.split('
');
    
    // Keep the last partial line in the buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const parsed = JSON.parse(line);
        
        // If it's a JSON-RPC response, emit it
        if (parsed.jsonrpc === '2.0') {
          this.emit('response', parsed as MCPResponse);
        } 
        // If it's a streamed token (thought/action), emit it
        else if (parsed.type === 'thought' || parsed.type === 'action') {
          this.emit('token', parsed as MCPToken);
        }
      } catch (e) {
        // Ignore non-JSON lines (should be minimal if server is correct)
        this.emit('error', new Error(`Failed to parse MCP line: ${line}`));
      }
    }
  }

  /**
   * Sends a JSON-RPC 2.0 request to the server.
   */
  async sendRequest(method: string, params: any): Promise<MCPResponse> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request = {
        jsonrpc: '2.0',
        method,
        params,
        id,
      };

      this.child?.stdin?.write(JSON.stringify(request) + '
');

      const responseHandler = (response: MCPResponse) => {
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
  async startAutonomousAudit(repoMap: any, apiKeys: any): Promise<string> {
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
  async disconnect(): Promise<void> {
    if (this.child) {
      this.child.kill('SIGTERM');
      this.child = null;
    }
  }
}
