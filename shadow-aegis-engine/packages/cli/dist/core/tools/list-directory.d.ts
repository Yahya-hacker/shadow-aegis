import { type PathGuard } from '../policy/path-guard.js';
export declare function createListDirectoryTool(pathGuard: PathGuard): import("ai").Tool<{
    path: string;
}, string>;
