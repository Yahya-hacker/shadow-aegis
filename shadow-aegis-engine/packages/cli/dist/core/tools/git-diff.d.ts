/**
 * Git Diff Helper — Incremental Scan Mode
 *
 * Returns the list of files changed relative to a given git ref.
 * Used to scope the analysis to only changed files when --since or --diff
 * flags are provided.
 */
export interface ChangedFilesOptions {
    /** Base git ref (branch, tag, commit SHA). Defaults to "HEAD~1". */
    baseRef?: string;
    /** Repository root directory. Defaults to cwd. */
    cwd?: string;
    /** Only include files with these extensions. If empty, all files are returned. */
    extensions?: string[];
}
export interface ChangedFilesResult {
    /** Changed file paths relative to the repo root */
    files: string[];
    /** The resolved base ref used */
    resolvedRef: string;
    /** Whether the result is a full-file list (fallback when git unavailable) */
    usedFallback: boolean;
}
/**
 * Get the list of files changed relative to `baseRef`.
 *
 * Falls back to an empty `files` array with `usedFallback: true` if git
 * is not available or the repo has no commits.
 */
export declare function getChangedFiles(options?: ChangedFilesOptions): Promise<ChangedFilesResult>;
/**
 * Build a concise repo-map hint that can be prepended to the agent context,
 * scoping the analysis to the list of changed files.
 */
export declare function buildDiffScopeHint(result: ChangedFilesResult): string;
