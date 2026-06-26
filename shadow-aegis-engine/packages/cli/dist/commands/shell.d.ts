import { Command } from '@oclif/core';
export default class Shell extends Command {
    static description: string;
    static examples: string[];
    static flags: {
        ci: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        diff: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        expertUnsafe: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        'fail-on': import("@oclif/core/interfaces").OptionFlag<"critical" | "high" | "low" | "medium" | "none", import("@oclif/core/interfaces").CustomOptions>;
        mode: import("@oclif/core/interfaces").OptionFlag<"balanced" | "deep" | "deep-sast" | "full-report" | "patch-only" | "quick" | "triage" | undefined, import("@oclif/core/interfaces").CustomOptions>;
        reconfigure: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        since: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
    };
    run(): Promise<void>;
}
