import { tool } from 'ai';
import { confirmMcpToolExecution } from '../../utils/human-in-loop.js';
import { evaluateMcpPolicy } from './policy.js';
function createAgentToolName(adapterId, toolName) {
    return `mcp_${adapterId}_${toolName}`.replaceAll(/[^a-zA-Z0-9_]/g, '_');
}
function formatMcpOutput(output) {
    if (typeof output === 'string') {
        return output;
    }
    return JSON.stringify(output, null, 2);
}
export class MCPManager {
    options;
    adapters = new Map();
    constructor(options) {
        this.options = options;
    }
    buildAgentTools() {
        const tools = {};
        for (const adapter of this.adapters.values()) {
            if (adapter.isAvailable && !adapter.isAvailable()) {
                continue;
            }
            const executionContext = {
                expertUnsafe: this.options.expertUnsafe,
                targetPath: this.options.targetPath,
            };
            for (const definition of adapter.listTools()) {
                const toolName = createAgentToolName(adapter.id, definition.name);
                tools[toolName] = this.wrapTool(adapter.id, definition, executionContext);
            }
        }
        return tools;
    }
    discoverCapabilities() {
        return [...this.adapters.values()].map((adapter) => ({
            adapterId: adapter.id,
            available: adapter.isAvailable ? adapter.isAvailable() : true,
            capabilities: adapter.capabilities,
            displayName: adapter.displayName,
            tools: adapter.listTools().map((toolDefinition) => toolDefinition.name),
        }));
    }
    async initialize() {
        for (const adapter of this.adapters.values()) {
            if (adapter.initialize) {
                await adapter.initialize();
            }
        }
    }
    registerAdapter(adapter) {
        this.adapters.set(adapter.id, adapter);
    }
    async shutdown() {
        for (const adapter of this.adapters.values()) {
            if (adapter.shutdown) {
                await adapter.shutdown();
            }
        }
    }
    wrapTool(adapterId, definition, context) {
        return tool({
            description: `[MCP:${adapterId}] ${definition.description}`,
            async execute(input) {
                const policyDecision = evaluateMcpPolicy(adapterId, definition, context.expertUnsafe);
                if (!policyDecision.allowed) {
                    return policyDecision.reason;
                }
                const { warning } = policyDecision;
                if (definition.requiresConfirmation || warning) {
                    const confirmed = await confirmMcpToolExecution(adapterId, definition.name, input, warning);
                    if (!confirmed) {
                        return `[DENIED] User denied MCP tool execution for ${adapterId}.${definition.name}.`;
                    }
                }
                const output = await definition.execute(input, context);
                return formatMcpOutput(output);
            },
            inputSchema: definition.inputSchema,
        });
    }
}
