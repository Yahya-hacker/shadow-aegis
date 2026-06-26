export declare class PathGuardError extends Error {
    constructor(message: string);
}
export interface PathGuard {
    resolveExistingPath(relativePath: string): Promise<string>;
    resolvePathForWrite(relativePath: string): Promise<string>;
    readonly rootPath: string;
    readonly rootRealPath: string;
    toRelative(absolutePath: string): string;
}
export declare function createPathGuard(rootPath: string): Promise<PathGuard>;
export declare function ensurePathInsideRoot(rootRealPath: string, candidateRealPath: string): void;
