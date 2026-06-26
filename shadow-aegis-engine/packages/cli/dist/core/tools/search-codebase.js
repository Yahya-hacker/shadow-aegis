import { tool } from 'ai';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { z } from 'zod';
const TEXT_EXTENSIONS = new Set([
    '.c',
    '.cpp',
    '.cs',
    '.css',
    '.go',
    '.h',
    '.hpp',
    '.html',
    '.java',
    '.js',
    '.json',
    '.jsx',
    '.md',
    '.mjs',
    '.php',
    '.py',
    '.rb',
    '.rs',
    '.scss',
    '.svelte',
    '.ts',
    '.tsx',
    '.txt',
    '.vue',
    '.yaml',
    '.yml',
]);
const SKIP_DIRS = new Set(['.git', '.next', '.turbo', 'build', 'coverage', 'dist', 'node_modules']);
function normalizeExtensionFilter(extension) {
    if (!extension) {
        return undefined;
    }
    const normalized = extension.trim();
    if (!normalized) {
        return undefined;
    }
    return normalized.startsWith('.') ? normalized : `.${normalized}`;
}
export function createSearchCodebaseTool(pathGuard) {
    return tool({
        description: 'Searches code for regex patterns with text-file filtering and symlink-safe traversal. Excludes node_modules and .git.',
        async execute({ fileExtension, regexPattern }) {
            const results = [];
            const extensionFilter = normalizeExtensionFilter(fileExtension);
            let regex;
            try {
                regex = new RegExp(regexPattern, 'gi');
            }
            catch (error) {
                return `[ERROR] Invalid regex pattern: ${error.message}`;
            }
            async function walk(directoryPath) {
                const entries = await fs.readdir(directoryPath, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.name.startsWith('.') && entry.name !== '.env') {
                        continue;
                    }
                    if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) {
                        continue;
                    }
                    const fullPath = path.join(directoryPath, entry.name);
                    const lstat = await fs.lstat(fullPath);
                    if (lstat.isSymbolicLink()) {
                        continue;
                    }
                    if (entry.isDirectory()) {
                        await walk(fullPath);
                        continue;
                    }
                    if (!entry.isFile()) {
                        continue;
                    }
                    const ext = path.extname(entry.name);
                    if (extensionFilter && ext !== extensionFilter) {
                        continue;
                    }
                    if (!TEXT_EXTENSIONS.has(ext)) {
                        continue;
                    }
                    let content;
                    try {
                        content = await fs.readFile(fullPath, 'utf8');
                    }
                    catch {
                        continue;
                    }
                    const lines = content.split(/\r?\n/u);
                    for (const [lineIndex, line] of lines.entries()) {
                        if (regex.test(line)) {
                            const relativePath = path.relative(pathGuard.rootRealPath, fullPath);
                            results.push(`${relativePath}:${lineIndex + 1}: ${line.trim()}`);
                        }
                        regex.lastIndex = 0;
                    }
                }
            }
            try {
                await walk(pathGuard.rootRealPath);
            }
            catch (error) {
                return `[ERROR] Search failed: ${error.message}`;
            }
            if (results.length === 0) {
                return `[INFO] No matches found for pattern: ${regexPattern}`;
            }
            const maxResults = 100;
            const limitedResults = results.slice(0, maxResults);
            return `// ─── SEARCH RESULTS for "${regexPattern}" ───\n// Found ${results.length} matches${results.length > maxResults ? ` (showing first ${maxResults})` : ''}\n\n${limitedResults.join('\n')}`;
        },
        inputSchema: z.object({
            fileExtension: z.string().optional().describe('Optional extension filter (".ts", ".js", ".py").'),
            regexPattern: z
                .string()
                .max(200)
                .describe(String.raw `Regex pattern to search for (example: "eval\\s*\\(").`),
        }),
    });
}
