import { type SecurityReport } from './report-schema.js';
export interface RepairContext {
    attempt: number;
    lastCandidate: null | string;
    validationError: string;
}
export interface ValidateAndRepairOptions {
    maxRetries?: number;
    repair?: (context: RepairContext) => Promise<string>;
    responseText: string;
}
export interface ValidateAndRepairResult {
    attempts: number;
    jsonText: string;
    repaired: boolean;
    report: SecurityReport;
}
export declare function extractJsonBlock(text: string): null | string;
export declare function validateAndRepairReport({ maxRetries, repair, responseText, }: ValidateAndRepairOptions): Promise<ValidateAndRepairResult>;
