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
        /// Protocol treasury address that collects fees
        address treasury_address;
        /// Protocol fee in basis points (150 = 1.5%)
        uint256 fee_bps;
        /// Governance / admin owner
        address owner;
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

/// Default protocol treasury wallet: 0x3FDbfB2caB39077a478ABA0cf66c720d1eAac4a0
pub const DEFAULT_TREASURY: Address = Address::new([
    0x3f, 0xdb, 0xfb, 0x2c, 0xab, 0x39, 0x07, 0x7a, 0x47, 0x8a, 0xba, 0x0c, 0xf6, 0x6c, 0x72, 0x0d,
    0x1e, 0xaa, 0xc4, 0xa0,
]);

/// Default protocol fee: 1.5% (150 basis points)
pub const DEFAULT_FEE_BPS: u32 = 150;

// Declare Solidity events
sol! {
    event TaskCreated(bytes32 indexed taskId, address indexed creator, address indexed agent, uint256 bounty, uint256 minScore);
    event TaskCompleted(bytes32 indexed taskId, address indexed agent, uint256 achievedScore, uint256 payout, uint256 fee);
    event TaskRefunded(bytes32 indexed taskId, address indexed creator, uint256 refundAmount);
    event ProtocolFeeCollected(bytes32 indexed taskId, address indexed treasury, uint256 feeAmount);
}

#[public]
impl StylusNexus {
    /// Returns the active treasury address that receives protocol fees.
    pub fn get_effective_treasury(&self) -> Address {
        let stored = self.treasury_address.get();
        if stored == Address::ZERO {
            DEFAULT_TREASURY
        } else {
            stored
        }
    }

    /// Returns the active protocol fee in basis points (default: 150 = 1.5%).
    pub fn get_effective_fee_bps(&self) -> u32 {
        let stored = self.fee_bps.get();
        if stored == U256::ZERO {
            DEFAULT_FEE_BPS
        } else {
            stored.to::<u32>()
        }
    }

    /// Returns protocol fee settings: (treasury_address, fee_bps)
    pub fn get_protocol_fee_info(&self) -> (Address, u32) {
        (self.get_effective_treasury(), self.get_effective_fee_bps())
    }

    /// Updates the treasury address (restricted to contract owner/deployer).
    pub fn set_treasury(&mut self, new_treasury: Address) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let owner = self.owner.get();
        if owner == Address::ZERO {
            self.owner.set(sender);
        } else if sender != owner {
            return Err("Unauthorized".as_bytes().to_vec());
        }
        if new_treasury == Address::ZERO {
            return Err("Invalid treasury address".as_bytes().to_vec());
        }
        self.treasury_address.set(new_treasury);
        Ok(())
    }

    /// Updates the protocol fee in basis points (max 1000 = 10%).
    pub fn set_fee_bps(&mut self, new_fee_bps: u32) -> Result<(), Vec<u8>> {
        let sender = self.vm().msg_sender();
        let owner = self.owner.get();
        if owner == Address::ZERO {
            self.owner.set(sender);
        } else if sender != owner {
            return Err("Unauthorized".as_bytes().to_vec());
        }
        if new_fee_bps > 1000 {
            return Err("Fee cannot exceed 10% (1000 bps)".as_bytes().to_vec());
        }
        self.fee_bps.set(U256::from(new_fee_bps));
        Ok(())
    }

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

        // Auto-initialize owner to first task creator if unassigned
        if self.owner.get() == Address::ZERO {
            self.owner.set(sender);
        }

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

    /// Evaluates candidate AI vectors, checks minimum threshold, deducts protocol fee (1.5%),
    /// routes fee to treasury (0x3FDbfB2caB39077a478ABA0cf66c720d1eAac4a0), and releases payout to agent.
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

        // Calculate protocol fee (default: 1.5% = 150 basis points)
        let fee_bps_val = self.get_effective_fee_bps();
        let treasury = self.get_effective_treasury();
        let fee = (bounty * U256::from(fee_bps_val)) / U256::from(10000);
        let agent_payout = bounty - fee;

        // Mark as completed
        self.task_statuses.insert(task_id, U256::from(2));
        self.task_achieved_scores.insert(task_id, U256::from(score));
        self.task_bounties.insert(task_id, U256::ZERO);

        // Transfer protocol fee to treasury if fee > 0
        if fee > U256::ZERO && transfer_eth(self.vm(), treasury, fee).is_err() {
            return Err("Treasury fee transfer failed".as_bytes().to_vec());
        }

        // Release remaining bounty to authorized agent / solver
        if transfer_eth(self.vm(), recipient, agent_payout).is_err() {
            return Err("Payout transfer failed".as_bytes().to_vec());
        }

        if fee > U256::ZERO {
            self.vm().log(ProtocolFeeCollected {
                taskId: task_id,
                treasury,
                feeAmount: fee,
            });
        }

        self.vm().log(TaskCompleted {
            taskId: task_id,
            agent: recipient,
            achievedScore: U256::from(score),
            payout: agent_payout,
            fee,
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

        if transfer_eth(self.vm(), creator, bounty).is_err() {
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_treasury_and_fee() {
        let expected_treasury = Address::new([
            0x3f, 0xdb, 0xfb, 0x2c, 0xab, 0x39, 0x07, 0x7a, 0x47, 0x8a, 0xba, 0x0c, 0xf6, 0x6c,
            0x72, 0x0d, 0x1e, 0xaa, 0xc4, 0xa0,
        ]);
        assert_eq!(DEFAULT_TREASURY, expected_treasury);
        assert_eq!(DEFAULT_FEE_BPS, 150);

        // Test fee calculation on 1 ETH
        let bounty = U256::from(1_000_000_000_000_000_000u64); // 1 ETH
        let fee = (bounty * U256::from(DEFAULT_FEE_BPS)) / U256::from(10000);
        let payout = bounty - fee;

        assert_eq!(fee, U256::from(15_000_000_000_000_000u64)); // 0.015 ETH
        assert_eq!(payout, U256::from(985_000_000_000_000_000u64)); // 0.985 ETH
        assert_eq!(fee + payout, bounty);
    }
}
