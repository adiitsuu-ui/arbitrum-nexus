//! Arbitrum Stylus Nexus: On-Chain AI Agent Escrow & High-Performance Verifier
//!
//! Exposes EVM-compatible ABI for:
//! 1. Ultra-fast WebAuthn / Passkey P-256 signature verification.
//! 2. Mathematical Vector Cosine Similarity verification for AI outputs.
//! 3. Autonomous AI Agent task escrow and sub-second settlement.

#![cfg_attr(not(any(feature = "export-abi", test)), no_main)]
extern crate alloc;

use alloc::vec::Vec;
use alloy_sol_types::sol;
use stylus_sdk::{
    alloy_primitives::{Address, B256, U256},
    call::transfer::transfer_eth,
    prelude::*,
    stylus_core::host::{LogAccess, MessageAccess},
};

pub mod passkey;
pub mod verifier;

use passkey::verify_p256_signature;
use verifier::compute_cosine_similarity_bps;

sol_storage! {
    #[entrypoint]
    pub struct StylusNexus {
        /// Task bounty amounts stored by task_id
        mapping(bytes32 => uint256) task_bounties;
        /// Task creator address
        mapping(bytes32 => address) task_creators;
        /// Assigned or allowed agent address
        mapping(bytes32 => address) task_agents;
        /// Minimum similarity required in basis points (1 - 10000)
        mapping(bytes32 => uint256) task_min_scores;
        /// Task status: 0 = Uninitialized, 1 = Open, 2 = Completed, 3 = Refunded
        mapping(bytes32 => uint256) task_statuses;
        /// Achieved score in basis points
        mapping(bytes32 => uint256) task_achieved_scores;
    }
}

// Declare Solidity events
sol! {
    event TaskCreated(bytes32 indexed taskId, address indexed creator, address indexed agent, uint256 bounty, uint256 minScore);
    event TaskCompleted(bytes32 indexed taskId, address indexed agent, uint256 achievedScore, uint256 payout);
    event TaskRefunded(bytes32 indexed taskId, address indexed creator, uint256 refundAmount);
}

#[public]
impl StylusNexus {
    /// Verifies a hardware WebAuthn / Passkey (NIST P-256 / secp256r1) signature.
    /// Runs directly in native WASM instructions on Arbitrum Stylus.
    pub fn verify_passkey(&self, pubkey: Vec<u8>, msg_hash: B256, signature: Vec<u8>) -> bool {
        let hash_bytes: [u8; 32] = msg_hash.0;
        verify_p256_signature(&pubkey, &hash_bytes, &signature)
    }

    /// Computes and verifies cosine similarity between two vector embeddings.
    /// Returns: (is_passing: bool, score_bps: uint256)
    pub fn verify_vector_similarity(
        &self,
        vec_a: Vec<i32>,
        vec_b: Vec<i32>,
        min_threshold_bps: u32,
    ) -> (bool, u32) {
        let score = compute_cosine_similarity_bps(&vec_a, &vec_b);
        let passed = score >= min_threshold_bps;
        (passed, score)
    }

    /// Creates an AI escrow task locked with ETH bounty.
    #[payable]
    pub fn create_task(
        &mut self,
        task_id: B256,
        agent: Address,
        min_score_bps: u32,
    ) -> Result<(), Vec<u8>> {
        let status = self.task_statuses.get(task_id);
        if status != U256::ZERO {
            return Err("Task already exists".as_bytes().to_vec());
        }

        let bounty = self.vm().msg_value();
        if bounty == U256::ZERO {
            return Err("Bounty required".as_bytes().to_vec());
        }

        let sender = self.vm().msg_sender();
        let min_score = U256::from(min_score_bps);

        self.task_bounties.insert(task_id, bounty);
        self.task_creators.insert(task_id, sender);
        self.task_agents.insert(task_id, agent);
        self.task_min_scores.insert(task_id, min_score);
        self.task_statuses.insert(task_id, U256::from(1)); // 1 = Open

        self.vm().log(TaskCreated {
            taskId: task_id,
            creator: sender,
            agent,
            bounty,
            minScore: min_score,
        });

        Ok(())
    }

    /// Evaluates candidate AI vectors, checks minimum threshold, and releases escrow funds to the agent.
    pub fn settle_ai_task(
        &mut self,
        task_id: B256,
        reference_vector: Vec<i32>,
        candidate_vector: Vec<i32>,
    ) -> Result<u32, Vec<u8>> {
        let status = self.task_statuses.get(task_id);
        if status != U256::from(1) {
            return Err("Task not open".as_bytes().to_vec());
        }

        let sender = self.vm().msg_sender();
        let agent = self.task_agents.get(task_id);

        // Security check: If a specific agent was designated, only that agent can settle.
        // If agent is Address::ZERO (open bounty), any agent can settle and receives the payout.
        if agent != Address::ZERO && sender != agent {
            return Err("Unauthorized agent".as_bytes().to_vec());
        }
        let recipient = if agent == Address::ZERO { sender } else { agent };

        let min_score = self.task_min_scores.get(task_id);
        let score = compute_cosine_similarity_bps(&reference_vector, &candidate_vector);

        if U256::from(score) < min_score {
            return Err("Score below required threshold".as_bytes().to_vec());
        }

        let bounty = self.task_bounties.get(task_id);

        // Mark as completed
        self.task_statuses.insert(task_id, U256::from(2));
        self.task_achieved_scores.insert(task_id, U256::from(score));
        self.task_bounties.insert(task_id, U256::ZERO);

        // Release bounty to authorized agent / solver
        if let Err(_) = transfer_eth(self.vm(), recipient, bounty) {
            return Err("Payout transfer failed".as_bytes().to_vec());
        }

        self.vm().log(TaskCompleted {
            taskId: task_id,
            agent: recipient,
            achievedScore: U256::from(score),
            payout: bounty,
        });

        Ok(score)
    }

    /// Allows the creator to refund the bounty if task is unfulfilled.
    pub fn refund_task(&mut self, task_id: B256) -> Result<(), Vec<u8>> {
        let status = self.task_statuses.get(task_id);
        if status != U256::from(1) {
            return Err("Task cannot be refunded".as_bytes().to_vec());
        }

        let creator = self.task_creators.get(task_id);
        if self.vm().msg_sender() != creator {
            return Err("Only creator can refund".as_bytes().to_vec());
        }

        let bounty = self.task_bounties.get(task_id);
        self.task_statuses.insert(task_id, U256::from(3)); // 3 = Refunded
        self.task_bounties.insert(task_id, U256::ZERO);

        if let Err(_) = transfer_eth(self.vm(), creator, bounty) {
            return Err("Refund transfer failed".as_bytes().to_vec());
        }

        self.vm().log(TaskRefunded {
            taskId: task_id,
            creator,
            refundAmount: bounty,
        });

        Ok(())
    }

    /// View helper to check task details
    pub fn get_task_info(&self, task_id: B256) -> (U256, U256, U256, U256, Address) {
        let status = self.task_statuses.get(task_id);
        let min_score = self.task_min_scores.get(task_id);
        let achieved_score = self.task_achieved_scores.get(task_id);
        let bounty = self.task_bounties.get(task_id);
        let agent = self.task_agents.get(task_id);

        (status, min_score, achieved_score, bounty, agent)
    }
}
