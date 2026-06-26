/**
 * Test Runner - Twin-Container CI with Baseline Determinism.
 *
 * Executes the project's test suite inside ephemeral Docker containers,
 * never on the host machine. Supports baseline fingerprinting to tolerate
 * pre-existing flaky tests: a patch is valid if it introduces ZERO new
 * failures compared to the baseline.
 */
export interface TestFingerprint {
    entries: Array<{
        status: 'fail' | 'pass' | 'skip';
        testName: string;
    }>;
    framework: string;
    hash: string;
    timestamp: string;
}
export interface TestResult {
    baseline?: TestFingerprint;
    command: string;
    degraded: boolean;
    durationMs: number;
    exitCode: number;
    fingerprint: TestFingerprint;
    framework: string;
    newFailures: string[];
    passed: boolean;
    resolvedFailures: string[];
    stderr: string;
    stdout: string;
}
export interface TestRunnerOptions {
    containerImage?: string;
    projectRoot: string;
    testCommand?: string;
    timeoutMs?: number;
    useDocker?: boolean;
}
interface DetectedFramework {
    command: string;
    image: string;
    name: string;
}
export declare class TestRunner {
    private baseline;
    private readonly containerImage;
    private readonly framework;
    private readonly projectRoot;
    private readonly testCommand;
    private readonly timeoutMs;
    private readonly useDocker;
    private constructor();
    /**
     * Auto-detect test framework and create a TestRunner.
     */
    static detect(options: TestRunnerOptions): Promise<TestRunner>;
    /**
     * Create a TestRunner with explicit framework details. Used in tests.
     */
    static fromFramework(options: TestRunnerOptions, framework: DetectedFramework): TestRunner;
    /**
     * Capture a baseline fingerprint before the swarm begins.
     * This records which tests pass/fail so we can detect degradation later.
     */
    captureBaseline(): Promise<TestFingerprint>;
    /**
     * Get the current baseline fingerprint.
     */
    getBaseline(): TestFingerprint | undefined;
    /**
     * Get detected framework info.
     */
    getFramework(): DetectedFramework;
    /**
     * Run the test suite and compare against baseline.
     */
    run(): Promise<TestResult>;
    /**
     * Set a previously captured baseline (for deserialization).
     */
    setBaseline(baseline: TestFingerprint): void;
    private buildCommand;
    private executeTests;
}
export { type DetectedFramework };
