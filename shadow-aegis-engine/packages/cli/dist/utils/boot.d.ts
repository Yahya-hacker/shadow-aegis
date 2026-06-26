export declare const bootSequence: string[];
/**
 * Animation engine for ASCII art and boot logs
 * @param lines The array of pre-colored ASCII lines
 * @param delayMs The delay in milliseconds between each line
 */
export declare function animateBootUp(lines: string[], delayMs?: number): Promise<void>;
