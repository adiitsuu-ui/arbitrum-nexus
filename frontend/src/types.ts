import type { Address, Hex } from "viem";

export type TaskStatus = "open" | "settled" | "refunded";

export interface Task {
  id: Hex | string;
  creator: Address | string;
  agent: Address | string;
  bounty: number;
  minScore: number;
  achievedScore?: number;
  status: TaskStatus;
  description: string;
  vectorDimensions: number;
  txHash?: string;
  settleTxHash?: string;
  isLiveOnChain?: boolean;
  createdAt?: string;
  agentName?: string;
}

export interface LiveTransaction {
  hash: string;
  blockNumber: bigint;
  timestamp: string;
  gasLimit?: string;
}

export interface SolverAgent {
  id: string;
  name: string;
  role: string;
  address: Address | string;
  reputation: number;
  tasksCompleted: number;
  avgScore: number;
  avgInkWasm: number;
  status: "idle" | "solving" | "active";
}

export interface OrbitL3Block {
  blockNumber: number;
  timestamp: string;
  txCount: number;
  gasUsed: string;
  hash: string;
  prover: string;
}
