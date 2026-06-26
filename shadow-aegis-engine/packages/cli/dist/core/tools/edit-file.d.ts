import { type PathGuard } from '../policy/path-guard.js';
export declare function createEditFileTool(pathGuard: PathGuard): import("ai").Tool<{
    filePath: string;
    replacementCode: string;
    targetCode: string;
}, string>;
