import { tool } from 'ai';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { z } from 'zod';
import { confirmCommandExecution } from '../../utils/human-in-loop.js';
import { evaluateCommandPolicy } from '../policy/command-policy.js';
const execAsync = promisify(exec);
export function createExecuteCommandTool(options) {
    return tool({
        description: 'Executes a repository command. Enforces policy checks before user confirmation, then returns stdout/stderr.',
        async execute({ command }) {
            const policyDecision = evaluateCommandPolicy(command, options.commandPolicy);
            if (!policyDecision.allowed) {
                return policyDecision.reason;
            }
            const confirmed = await confirmCommandExecution(command, policyDecision.warning);
            if (!confirmed) {
                return `[DENIED] User denied command execution: "${command}".`;
            }
            try {
                const { stderr, stdout } = await execAsync(command, {
                    cwd: options.workingDirectory,
                    maxBuffer: 10 * 1024 * 1024,
                    timeout: 60_000,
                });
                let output = `// ─── COMMAND: ${command} ───\n`;
                if (stdout.trim()) {
                    output += `\n[STDOUT]\n${stdout.trim()}`;
                }
                if (stderr.trim()) {
                    output += `\n\n[STDERR]\n${stderr.trim()}`;
                }
                if (!stdout.trim() && !stderr.trim()) {
                    output += '\n[INFO] Command completed with no output.';
                }
                return output;
            }
            catch (error) {
                const execError = error;
                let output = `// ─── COMMAND FAILED: ${command} ───\n\n[ERROR] ${execError.message}`;
                if (execError.stdout?.trim()) {
                    output += `\n\n[STDOUT]\n${execError.stdout.trim()}`;
                }
                if (execError.stderr?.trim()) {
                    output += `\n\n[STDERR]\n${execError.stderr.trim()}`;
                }
                return output;
            }
        },
        inputSchema: z.object({
            command: z.string().describe('Shell command to execute.'),
        }),
    });
}
