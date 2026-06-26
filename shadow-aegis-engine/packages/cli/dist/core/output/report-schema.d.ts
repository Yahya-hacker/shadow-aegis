import { z } from 'zod';
export declare const findingSchema: z.ZodObject<{
    cvss_v31_score: z.ZodNumber;
    cvss_v31_vector: z.ZodString;
    cvss_v40_score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cwe: z.ZodString;
    file_paths: z.ZodArray<z.ZodString, "many">;
    severity_label: z.ZodEnum<["Critical", "High", "Info", "Low", "Medium"]>;
    title: z.ZodString;
    vuln_id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    cwe: string;
    title: string;
    cvss_v31_score: number;
    cvss_v31_vector: string;
    file_paths: string[];
    severity_label: "Critical" | "High" | "Medium" | "Low" | "Info";
    vuln_id: string;
    cvss_v40_score?: number | null | undefined;
}, {
    cwe: string;
    title: string;
    cvss_v31_score: number;
    cvss_v31_vector: string;
    file_paths: string[];
    severity_label: "Critical" | "High" | "Medium" | "Low" | "Info";
    vuln_id: string;
    cvss_v40_score?: number | null | undefined;
}>;
export declare const securityReportSchema: z.ZodObject<{
    findings: z.ZodArray<z.ZodObject<{
        cvss_v31_score: z.ZodNumber;
        cvss_v31_vector: z.ZodString;
        cvss_v40_score: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        cwe: z.ZodString;
        file_paths: z.ZodArray<z.ZodString, "many">;
        severity_label: z.ZodEnum<["Critical", "High", "Info", "Low", "Medium"]>;
        title: z.ZodString;
        vuln_id: z.ZodString;
    }, "strict", z.ZodTypeAny, {
        cwe: string;
        title: string;
        cvss_v31_score: number;
        cvss_v31_vector: string;
        file_paths: string[];
        severity_label: "Critical" | "High" | "Medium" | "Low" | "Info";
        vuln_id: string;
        cvss_v40_score?: number | null | undefined;
    }, {
        cwe: string;
        title: string;
        cvss_v31_score: number;
        cvss_v31_vector: string;
        file_paths: string[];
        severity_label: "Critical" | "High" | "Medium" | "Low" | "Info";
        vuln_id: string;
        cvss_v40_score?: number | null | undefined;
    }>, "many">;
}, "strict", z.ZodTypeAny, {
    findings: {
        cwe: string;
        title: string;
        cvss_v31_score: number;
        cvss_v31_vector: string;
        file_paths: string[];
        severity_label: "Critical" | "High" | "Medium" | "Low" | "Info";
        vuln_id: string;
        cvss_v40_score?: number | null | undefined;
    }[];
}, {
    findings: {
        cwe: string;
        title: string;
        cvss_v31_score: number;
        cvss_v31_vector: string;
        file_paths: string[];
        severity_label: "Critical" | "High" | "Medium" | "Low" | "Info";
        vuln_id: string;
        cvss_v40_score?: number | null | undefined;
    }[];
}>;
export type SecurityFinding = z.infer<typeof findingSchema>;
export type SecurityReport = z.infer<typeof securityReportSchema>;
