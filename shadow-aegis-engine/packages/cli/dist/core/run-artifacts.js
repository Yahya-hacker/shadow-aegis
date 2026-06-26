import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
async function writeFileAtomic(filePath, content) {
    const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempPath, content, 'utf8');
    try {
        await fs.rename(tempPath, filePath);
    }
    catch (error) {
        const renameError = error;
        if (renameError.code === 'EEXIST' || renameError.code === 'EPERM') {
            await fs.rm(filePath, { force: true });
            await fs.rename(tempPath, filePath);
            return;
        }
        await fs.rm(tempPath, { force: true });
        throw error;
    }
}
function createRunId() {
    const timestamp = new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-');
    const shortId = randomUUID().slice(0, 8);
    return `${timestamp}-${shortId}`;
}
async function appendJsonLine(filePath, payload) {
    const line = `${JSON.stringify(payload)}\n`;
    await fs.appendFile(filePath, line, 'utf8');
}
export class RunArtifacts {
    runDirectory;
    messagesPath;
    meta;
    metaPath;
    reportJsonPath;
    reportMarkdownPath;
    reportSarifPath;
    toolEventsPath;
    constructor(runDirectory, initialMeta) {
        this.runDirectory = runDirectory;
        this.meta = initialMeta;
        this.metaPath = path.join(runDirectory, 'session-meta.json');
        this.messagesPath = path.join(runDirectory, 'messages.jsonl');
        this.toolEventsPath = path.join(runDirectory, 'tool-events.jsonl');
        this.reportMarkdownPath = path.join(runDirectory, 'report.md');
        this.reportJsonPath = path.join(runDirectory, 'report.json');
        this.reportSarifPath = path.join(runDirectory, 'report.sarif');
    }
    static async create(basePath, initialMeta) {
        const runId = createRunId();
        const startedAt = new Date().toISOString();
        const runDirectory = path.join(basePath, '.shadow-auditor', 'runs', runId);
        await fs.mkdir(runDirectory, { recursive: true });
        const instance = new RunArtifacts(runDirectory, {
            ...initialMeta,
            runId,
            startedAt,
        });
        await instance.writeMeta();
        return instance;
    }
    getRunDirectory() {
        return this.runDirectory;
    }
    async markCompleted() {
        this.meta = {
            ...this.meta,
            completedAt: new Date().toISOString(),
        };
        await this.writeMeta();
    }
    async recordMessage(event) {
        await appendJsonLine(this.messagesPath, event);
    }
    async recordToolEvent(event) {
        await appendJsonLine(this.toolEventsPath, event);
    }
    async updateMeta(partial) {
        this.meta = {
            ...this.meta,
            ...partial,
        };
        await this.writeMeta();
    }
    async writeReportJson(report) {
        await writeFileAtomic(this.reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
    }
    async writeReportMarkdown(markdown) {
        await writeFileAtomic(this.reportMarkdownPath, `${markdown}\n`);
    }
    async writeReportSarif(sarif) {
        await writeFileAtomic(this.reportSarifPath, `${JSON.stringify(sarif, null, 2)}\n`);
    }
    async writeMeta() {
        await writeFileAtomic(this.metaPath, `${JSON.stringify(this.meta, null, 2)}\n`);
    }
}
