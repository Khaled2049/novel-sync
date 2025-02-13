export enum Phase {
  Funding,
  Voting,
  Finalized,
}

// Types
export interface Proposal {
  description: string;
  voteCount: string;
}

export interface CampaignSummary {
  owner: string;
  title: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  phase: Phase;
  votingDeadline: number;
  winningProposalIndex: number;
  proposalsCount: number;
  pId?: number; // Added for backward compatibility
}

export interface Form {
  title: string;
  description: string;
  target: string;
  deadline: string;
  image: string;
}
