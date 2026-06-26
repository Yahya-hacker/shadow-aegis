/**
 * Consensus - Multi-agent decision making protocol.
 */
import { type Result } from '../schema/base.js';
import { type ConsensusRecord } from './hivemind-schema.js';
export interface ConsensusManagerOptions {
    defaultQuorum?: number;
    defaultTimeout?: number;
}
export type Vote = 'abstain' | 'approve' | 'reject';
/**
 * Manages consensus voting for multi-agent decisions.
 */
export declare class ConsensusManager {
    private readonly defaultQuorum;
    private readonly defaultTimeout;
    private records;
    constructor(options?: ConsensusManagerOptions);
    /**
     * Check and close expired proposals.
     */
    checkTimeouts(): ConsensusRecord[];
    /**
     * Create a consensus proposal.
     */
    createProposal(proposerId: string, topic: string, proposal: string, options?: {
        quorum?: number;
        timeout?: number;
    }): Result<ConsensusRecord, string>;
    /**
     * Export records for persistence.
     */
    exportRecords(): ConsensusRecord[];
    /**
     * Get all active (voting) proposals.
     */
    getActiveProposals(): ConsensusRecord[];
    /**
     * Get proposals by topic.
     */
    getProposalsByTopic(topic: string): ConsensusRecord[];
    /**
     * Get a consensus record.
     */
    getRecord(consensusId: string): ConsensusRecord | undefined;
    /**
     * Import records from persistence.
     */
    importRecords(records: ConsensusRecord[]): void;
    /**
     * Cast a vote on a proposal.
     */
    vote(consensusId: string, agentId: string, vote: Vote, comment?: string): Result<ConsensusRecord, string>;
    /**
     * Close voting on a proposal.
     */
    private closeVoting;
    /**
     * Evaluate if consensus has been reached.
     */
    private evaluateConsensus;
}
