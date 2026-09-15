// SPDX-License-Identifier: MIT-OR-APACHE-2.0
pragma solidity ^0.8.23;

/**
 * @title IStylusNexus
 * @notice Interface for the Arbitrum Stylus Nexus smart contract (compiled from Rust WASM).
 * Provides high-performance on-chain WebAuthn Passkey verification, vector cosine similarity
 * verification, and autonomous AI agent task escrow settlement.
 */
interface IStylusNexus {
    function verifyPasskey(uint8[] memory pubkey, bytes32 msg_hash, uint8[] memory signature) external view returns (bool);

    function verifyVectorSimilarity(int32[] memory vec_a, int32[] memory vec_b, uint32 min_threshold_bps) external view returns (bool, uint32);

    function createTask(bytes32 task_id, address agent, uint32 min_score_bps) external payable;

    function settleAiTask(bytes32 task_id, int32[] memory reference_vector, int32[] memory candidate_vector) external returns (uint32);

    function refundTask(bytes32 task_id) external;

    function getTaskInfo(bytes32 task_id) external view returns (uint256 status, uint256 minScore, uint256 achievedScore, uint256 bounty, address agent);
}
