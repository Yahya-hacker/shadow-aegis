import type { EnhancedReport } from './finding-schema.js';
import type { SecurityReport } from './report-schema.js';
export declare function generateSarifReport(report: SecurityReport): Record<string, unknown>;
/**
 * Generate SARIF 2.1.0 report from enhanced report format.
 */
export declare function generateEnhancedSarifReport(report: EnhancedReport): Record<string, unknown>;
