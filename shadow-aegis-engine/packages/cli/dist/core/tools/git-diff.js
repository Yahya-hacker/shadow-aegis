/**
 * Git Diff Helper — Incremental Scan Mode
 *
 * Returns the list of files changed relative to a given git ref.
 * Used to scope the analysis to only changed files when --since or --diff
 * flags are provided.
 */
import { execFile } from 'node:child_process';
import * as path from 'node:path';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
const DEFAULT_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
async function runGit(args, cwd) {
    const { stdout } = await execFileAsync('git', args, { cwd });
    return stdout.trim();
}
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
/**
 * Get the list of files changed relative to `baseRef`.
 *
 * Falls back to an empty `files` array with `usedFallback: true` if git
 * is not available or the repo has no commits.
 */
export async function getChangedFiles(options = {}) {
    const cwd = options.cwd ?? process.cwd();
    const baseRef = options.baseRef ?? 'HEAD~1';
    const exts = options.extensions?.length ? options.extensions : DEFAULT_EXTENSIONS;
    try {
        // Verify git is available and we are inside a repo
        await runGit(['rev-parse', '--is-inside-work-tree'], cwd);
        // Resolve the ref to a commit SHA for stability
        const resolvedSha = await runGit(['rev-parse', '--verify', baseRef], cwd);
        // Get list of changed files (names only, no status letters)
        const rawOutput = await runGit(['diff', '--name-only', '--diff-filter=ACMRT', resolvedSha, 'HEAD'], cwd);
        const allFiles = rawOutput
            ? rawOutput.split('\n').map((f) => f.trim()).filter(Boolean)
            : [];
        const filtered = allFiles.filter((f) => {
            const ext = path.extname(f).toLowerCase();
            return exts.includes(ext);
        });
        return {
            files: filtered,
            resolvedRef: resolvedSha.slice(0, 12),
            usedFallback: false,
        };
    }
    catch {
        return {
            files: [],
            resolvedRef: baseRef,
            usedFallback: true,
        };
    }
}
/**
 * Build a concise repo-map hint that can be prepended to the agent context,
 * scoping the analysis to the list of changed files.
 */
export function buildDiffScopeHint(result) {
    if (result.usedFallback || result.files.length === 0) {
        return '';
    }
    const fileList = result.files.map((f) => `  - ${f}`).join('\n');
    return `## Incremental Scan Scope (--since ${result.resolvedRef})

The following files changed since \`${result.resolvedRef}\`. Prioritise analysis of these files:

${fileList}

Files outside this list may still be inspected as context but should not be the primary focus.`;
}
