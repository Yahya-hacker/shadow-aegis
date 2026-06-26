import type { MCPAdapter, MCPRawInvoker } from '../types.js';
interface ChromeDevtoolsAdapterOptions {
    invoker?: MCPRawInvoker;
}
export declare function createChromeDevtoolsAdapter(options?: ChromeDevtoolsAdapterOptions): MCPAdapter;
export {};
