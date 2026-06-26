import { type PathGuard } from '../policy/path-guard.js';
export declare function createReadFileTool(pathGuard: PathGuard): import("ai").Tool<{
    filePath: string;
}, string>;
