import { parseAbi } from "viem";

export const stylusNexusAbi = parseAbi([
  "event TaskCreated(bytes32 indexed taskId, address indexed creator, address indexed agent, uint256 bounty, uint256 minScore)",
  "event TaskCompleted(bytes32 indexed taskId, address indexed agent, uint256 achievedScore, uint256 payout, uint256 fee)",
  "event TaskRefunded(bytes32 indexed taskId, address indexed creator, uint256 refundAmount)",
  "event ProtocolFeeCollected(bytes32 indexed taskId, address indexed treasury, uint256 feeAmount)",
  "function getEffectiveTreasury() external view returns (address)",
  "function getEffectiveFeeBps() external view returns (uint32)",
  "function getProtocolFeeInfo() external view returns (address, uint32)",
  "function setTreasury(address new_treasury) external",
  "function setFeeBps(uint32 new_fee_bps) external",
  "function verifyPasskey(uint8[] pubkey, bytes32 msg_hash, uint8[] signature) external view returns (bool)",
  "function verifyVectorSimilarity(int32[] vec_a, int32[] vec_b, uint32 min_threshold_bps) external view returns (bool, uint32)",
  "function createTask(bytes32 task_id, address agent, uint32 min_score_bps) external payable",
  "function settleAiTask(bytes32 task_id, int32[] reference_vector, int32[] candidate_vector) external returns (uint32)",
  "function refundTask(bytes32 task_id) external",
  "function getTaskInfo(bytes32 task_id) external view returns (uint256 status, uint256 minScore, uint256 achievedScore, uint256 bounty, address agent)"
]);

import type { Address } from "viem";

export const DEFAULT_CONTRACT_ADDRESS: Address =
  ((import.meta.env?.VITE_STYLUS_CONTRACT_ADDRESS as string) ||
    "0x241950ddf85e90e286eaa46878eb72d1440b67f9") as Address;

export const ARBITRUM_SEPOLIA_CHAIN_ID =
  Number(import.meta.env?.VITE_CHAIN_ID) || 421614;

export const ARBITRUM_SEPOLIA_RPC =
  (import.meta.env?.VITE_ARBITRUM_SEPOLIA_RPC as string) ||
  "https://sepolia-rollup.arbitrum.io/rpc";

export const ARBISCAN_EXPLORER_URL =
  (import.meta.env?.VITE_ARBISCAN_EXPLORER_URL as string) ||
  "https://sepolia.arbiscan.io";
