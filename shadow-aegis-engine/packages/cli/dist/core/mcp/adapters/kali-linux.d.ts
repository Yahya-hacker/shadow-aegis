import type { MCPAdapter, MCPRawInvoker } from '../types.js';
interface KaliLinuxAdapterOptions {
    invoker?: MCPRawInvoker;
}
export declare function createKaliLinuxAdapter(options?: KaliLinuxAdapterOptions): MCPAdapter;
export {};
