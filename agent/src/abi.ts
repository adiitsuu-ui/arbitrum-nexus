import { parseAbi } from "viem";

export const stylusNexusAbi = parseAbi([
  "event TaskCreated(bytes32 indexed taskId, address indexed creator, address indexed agent, uint256 bounty, uint256 minScore)",
  "event TaskCompleted(bytes32 indexed taskId, address indexed agent, uint256 achievedScore, uint256 payout)",
  "event TaskRefunded(bytes32 indexed taskId, address indexed creator, uint256 refundAmount)",
  "function verifyPasskey(uint8[] pubkey, bytes32 msg_hash, uint8[] signature) external view returns (bool)",
  "function verifyVectorSimilarity(int32[] vec_a, int32[] vec_b, uint32 min_threshold_bps) external view returns (bool, uint32)",
  "function createTask(bytes32 task_id, address agent, uint32 min_score_bps) external payable",
  "function settleAiTask(bytes32 task_id, int32[] reference_vector, int32[] candidate_vector) external returns (uint32)",
  "function refundTask(bytes32 task_id) external",
  "function getTaskInfo(bytes32 task_id) external view returns (uint256 status, uint256 minScore, uint256 achievedScore, uint256 bounty, address agent)"
]);
