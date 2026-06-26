import type { PathGuard } from '../policy/path-guard.js';
export declare function createSearchCodebaseTool(pathGuard: PathGuard): import("ai").Tool<{
    regexPattern: string;
    fileExtension?: string | undefined;
}, string>;
