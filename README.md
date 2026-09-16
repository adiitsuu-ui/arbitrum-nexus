# Arbitrum Stylus Agent Nexus (`arbitrum-nexus`)

[![Arbitrum Stylus](https://img.shields.io/badge/Arbitrum-Stylus_WASM-12AAFF?logo=arbitrum&logoColor=white)](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
[![Vercel Deployment](https://img.shields.io/badge/Live_App-Vercel-000000?logo=vercel&logoColor=white)](https://arbitrum-nexus-pied.vercel.app)
[![GitHub Pages](https://img.shields.io/badge/Mirror-GitHub_Pages-2ea44f?logo=github&logoColor=white)](https://adiitsuu-ui.github.io/arbitrum-nexus/)
[![Rust 2021](https://img.shields.io/badge/Rust-2021_no__std-DEA584?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![Viem](https://img.shields.io/badge/Viem-v2-black)](https://viem.sh)
[![Bun](https://img.shields.io/badge/Runtime-Bun-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![Orbit L3](https://img.shields.io/badge/Arbitrum-Orbit_L3_Appchain-9945FF)](https://docs.arbitrum.io/launch-orbit-chain/orbit-quickstart)
[![License: MIT/Apache-2.0](https://img.shields.io/badge/License-MIT%20OR%20Apache--2.0-blue.svg)](LICENSE)

An end-to-end, production-grade compute escrow and verification protocol running on **Arbitrum Stylus (WASM)**. The platform combines hardware-enclave biometric authentication (WebAuthn Passkeys), deterministic on-chain neural embedding verification (vector cosine similarity), autonomous event-driven execution agents, and a dedicated Arbitrum Orbit Layer 3 app-chain topology.

- 🌐 **Live Web Application (Vercel)**: [https://arbitrum-nexus-pied.vercel.app](https://arbitrum-nexus-pied.vercel.app)
- 🌐 **Global Mirror (GitHub Pages)**: [https://adiitsuu-ui.github.io/arbitrum-nexus/](https://adiitsuu-ui.github.io/arbitrum-nexus/)
- 📜 **Arbitrum Foundation Grant Proposal**: [`docs/GRANT_PROPOSAL.md`](docs/GRANT_PROPOSAL.md)
- 🚀 **Technical Launch Thread**: [`docs/LAUNCH_THREAD.md`](docs/LAUNCH_THREAD.md)
- 📍 **Arbitrum Sepolia Deployment**: [`0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9`](https://sepolia.arbiscan.io/address/0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9)

---

## High-Level Architecture

Arbitrum Stylus enables native WebAssembly execution alongside standard EVM state transitions. Stylus contracts run at bare-metal speed while maintaining full composability with EVM contracts and native ETH transfers.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                          │
│                                                                                         │
│   ┌───────────────────────────────┐               ┌─────────────────────────────────┐   │
│   │   Frontend Command Center     │               │   Autonomous Sentinel Worker    │   │
│   │   (Vite + React + Viem)       │               │   (agent/src/agent.ts on Bun)   │   │
│   │   - Touch ID / Face ID        │               │   - Event Stream Monitoring     │   │
│   │   - Dual-Mode (Sandbox/Live)  │               │   - Local Vector Inference      │   │
│   │   - Dynamic Compute Estimator │               │   - Autonomous Settlement       │   │
│   └───────────────┬───────────────┘               └────────────────┬────────────────┘   │
└───────────────────┼────────────────────────────────────────────────┼────────────────────┘
                    │                                                │
                    │ 1. createTask() [ETH Bounty]                   │ 3. settleAiTask(vecA, vecB)
                    ▼                                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           ARBITRUM STYLUS WASM RUNTIME (L2 / L3)                        │
│                                                                                         │
│   Contract: 0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9                                  │
│                                                                                         │
│   ┌────────────────────────────────┐            ┌───────────────────────────────────┐   │
│   │   contracts/src/passkey.rs     │            │   contracts/src/verifier.rs       │   │
│   │   - NIST P-256 (secp256r1)     │            │   - Fixed-point Vector Math (BPS) │   │
│   │   - WebAuthn Hardware Signer   │            │   - Cosine Similarity Dot Product │   │
│   │   - ~4,200 ink (<$0.0001)      │            │   - Integer Sqrt Newton-Raphson   │   │
│   └────────────────────────────────┘            └───────────────────────────────────┘   │
│                                                                                         │
│   ┌─────────────────────────────────────────────────────────────────────────────────┐   │
│   │                         contracts/src/lib.rs (StylusNexus)                      │   │
│   │   - Non-custodial Escrow & Threshold Validation                                 │   │
│   │   - Automated Bounty Distribution via transfer_eth()                            │   │
│   │   - Emits: TaskCreated, TaskCompleted, TaskRefunded                             │   │
│   └─────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                         State Settlement  │ (AnyTrust DA / 250ms Blocks)
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    ARBITRUM ORBIT LAYER 3 TOPOLOGY (nexus-chain)                        │
│   Chain ID: 918237 | Native Token: $NEXUS | Parent: Arbitrum Sepolia (421614)           │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Live Smart Contract Deployments

The Stylus smart contract is deployed, activated, and verified on Arbitrum Sepolia Testnet:

| Parameter | Configuration | Block Explorer |
| :--- | :--- | :--- |
| **Network** | Arbitrum Sepolia (Chain ID: `421614`) | [Sepolia Rollup Explorer](https://sepolia.arbiscan.io) |
| **Contract Address** | `0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9` | [View on Arbiscan](https://sepolia.arbiscan.io/address/0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9) |
| **Compiler Target** | `wasm32-unknown-unknown` (`opt-level = "z"`) | Compiled from Rust |
| **ABI Interface** | `contracts/IStylusNexus.sol` | EVM Interoperable |
| **Status** | Active & Operational | On-Chain Verified |

---

## Stylus WASM vs. Standard EVM Benchmarks

Running compute-intensive cryptographic and vector operations in Stylus WASM reduces execution overhead by **96% to 98.7%** compared to equivalent EVM bytecode.

| Workload | Scale / Dimensions | Standard EVM (Solidity) | Stylus WASM (Rust) | Gas / Ink Reduction | Standard EVM Fee | Stylus Fee (0.1 Gwei) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **WebAuthn Passkey (P-256)** | 1 Signature (64B) | `320,000` gas | `4,200` ink | **98.7%** | ~$0.0896 | <$0.0001 |
| **Vector Similarity (Small)** | 128 dimensions | `94,000` gas | `3,800` ink | **96.0%** | ~$0.0263 | <$0.0001 |
| **Vector Similarity (Medium)** | 512 dimensions | `412,000` gas | `12,500` ink | **97.0%** | ~$0.1154 | ~$0.0003 |
| **Vector Similarity (Large)** | 1536 dimensions | `1,350,000` gas | `34,000` ink | **97.5%** | ~$0.3780 | ~$0.0009 |
| **SHA-256 + Merkle Iteration**| 100 rounds | `185,000` gas | `6,100` ink | **96.7%** | ~$0.0518 | <$0.0001 |

*Note: Benchmarks measured using quantitative gas meters in `agent/src/benchmark.ts`. Fees estimated at 0.1 Gwei base fee on Arbitrum L2.*

---

## Repository Structure

```
arbitrum-nexus/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml # CI/CD for automated GitHub Pages frontend build & deploy
├── contracts/               # Arbitrum Stylus Smart Contracts (Rust WASM)
│   ├── Cargo.toml           # stylus-sdk 0.10, p256, sha2, wasm32 cdylib config
│   ├── .env.example         # RPC, deployer private key, and contract addresses
│   ├── scripts/
│   │   ├── deploy.sh        # Automated compilation, Stylus check & deploy script
│   │   └── watch_and_deploy.sh # Balance detection & deployment automation
│   ├── src/
│   │   ├── lib.rs           # Contract entrypoint, storage & escrow state transitions
│   │   ├── verifier.rs      # Vector cosine similarity & Newton-Raphson integer sqrt
│   │   ├── passkey.rs       # NIST P-256 (secp256r1) WebAuthn signature verifier
│   │   └── main.rs          # Export-abi generator
│   └── IStylusNexus.sol     # Auto-generated Solidity interface for EVM interoperability
├── agent/                   # Autonomous Sentinel Agent & Gas Benchmark
│   ├── .env.example         # Agent wallet key, RPC, and contract configuration
│   ├── src/
│   │   ├── abi.ts           # Type-safe Viem contract ABI & constants
│   │   ├── benchmark.ts     # Stylus vs. EVM gas comparison benchmark runner
│   │   ├── test_live_contract.ts # Live integration test suite for Arbitrum Sepolia
│   │   └── agent.ts         # Autonomous worker with live wallet signing & event watcher
│   ├── tsconfig.json        # Strict TypeScript configuration
│   └── package.json
├── frontend/                # Interactive Web Command Center (Vite + React + Tailwind + Viem)
│   ├── .env.example         # Contract address & testnet RPC settings
│   ├── vercel.json          # Production deployment & security headers config
│   ├── src/
│   │   ├── abi.ts           # Contract ABI & network constants
│   │   ├── web3.ts          # Wallet connection, network switching, and on-chain escrow
│   │   ├── App.tsx          # Main dashboard with live/demo toggle & WebAuthn
│   │   └── index.css
│   └── package.json
├── docs/                    # Official documentation, grant proposals & launch kits
│   ├── GRANT_PROPOSAL.md    # Official Arbitrum Foundation / Stylus Sprint application
│   └── LAUNCH_THREAD.md     # Multi-platform technical launch copy & media kit
├── orbit/                   # Arbitrum Orbit Layer 3 App-Chain Blueprint
│   ├── orbit-config.json    # Complete Orbit L3 deployment configuration
│   ├── docker-compose.yml   # Turnkey Docker Compose orchestration for local Nitro node
│   ├── launch-orbit.sh      # Automated node bootstrap and lifecycle helper script
│   └── README.md            # App-chain operational runbook
├── DEPLOYMENT_RUNBOOK.md    # Comprehensive operator guide for testnet and mainnet
├── vercel.json              # Monorepo Vercel configuration
└── README.md                # Protocol overview and documentation
```

---

## Quickstart & Local Development

### 1. Prerequisites

Ensure your development environment has the following tools installed:

```bash
# 1. Rust and WASM target
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# 2. Bun JavaScript/TypeScript runtime
curl -fsSL https://bun.sh/install | bash

# 3. Stylus CLI (optional, for contract deployment)
cargo install --locked cargo-stylus
```

---

### 2. Smart Contracts (`contracts/`)

#### Run Unit Tests
```bash
cd contracts
cargo test
```
All vector arithmetic and cryptographic signature tests run natively on the host machine.

#### Compile Optimized WASM Binary
```bash
cargo build --target wasm32-unknown-unknown --release --no-default-features
```
The compiled output is located at `target/wasm32-unknown-unknown/release/stylus_nexus_contracts.wasm`.

#### Validate Stylus Compatibility
```bash
cargo stylus check \
  --wasm-file-path target/wasm32-unknown-unknown/release/stylus_nexus_contracts.wasm \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

---

### 3. Autonomous Sentinel Agent (`agent/`)

#### Install Dependencies & Verify Types
```bash
cd agent
bun install
bun run typecheck
```

#### Run Quantitative Gas Benchmark
```bash
bun run benchmark
```

#### Run Autonomous Worker
The agent supports two modes:
1. **Interactive / Demo Mode**: Runs local neural inference and benchmarks without requiring a private key.
   ```bash
   bun run agent
   ```
2. **Persistent On-Chain Daemon**: Actively listens for `TaskCreated` events on Arbitrum Sepolia and executes automated settlements.
   ```bash
   cp .env.example .env
   # Populate AGENT_PRIVATE_KEY in .env
   bun run src/agent.ts --daemon
   ```

#### Run Live On-Chain Integration Tests
```bash
bun run src/test_live_contract.ts
```

---

### 4. Frontend Command Center (`frontend/`)

#### Development Server
```bash
cd frontend
bun install
bun run dev
```
The command center is accessible at `http://localhost:5173`.

#### Production Build
```bash
bun run build
```
Generates an optimized single-page bundle in `frontend/dist/`.

#### Preview Build Locally
```bash
bun run preview
```

---

### 5. Arbitrum Orbit Layer 3 App-Chain (`orbit/`)

To spin up a dedicated local Orbit L3 Nitro sequencer node linking to `orbit/orbit-config.json`:

```bash
# Start local L3 Nitro node via helper script
./orbit/launch-orbit.sh

# Or directly with Docker Compose:
cd orbit
docker compose up -d
```

Check node health:
```bash
./orbit/launch-orbit.sh status
./orbit/launch-orbit.sh logs
```

The node provides:
- **HTTP RPC**: `http://localhost:8547`
- **WebSocket**: `ws://localhost:8548`
- **Chain ID**: `918237`
- **Block Time**: `250ms`
- **Native Gas**: `$NEXUS`

To stop the container:
```bash
./orbit/launch-orbit.sh stop
```

---

## Production Deployment Guide

### Deploying Frontend to Vercel

The project contains pre-configured `vercel.json` deployment manifests for single-click deployment:

1. Connect the repository to your [Vercel Dashboard](https://vercel.com).
2. Set root directory to `frontend` (or deploy from repository root).
3. Add the following environment variables:
   - `VITE_STYLUS_CONTRACT_ADDRESS`: `0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9`
   - `VITE_ARBITRUM_SEPOLIA_RPC`: `https://sepolia-rollup.arbitrum.io/rpc`
   - `VITE_CHAIN_ID`: `421614`
   - `VITE_ARBISCAN_EXPLORER_URL`: `https://sepolia.arbiscan.io`
4. Trigger deployment.

---

## Security & Architectural Guarantees

1. **Non-Custodial Escrow**: ETH bounties locked in `createTask()` can only be released when `settleAiTask()` verifies candidate embeddings against the designated cosine threshold or refunded by the original creator via `refundTask()`.
2. **Reentrancy Protection**: State updates (`task_statuses` and `task_bounties` zeroing) precede external ETH transfers (`transfer_eth`).
3. **Deterministic Math**: Cosine similarity calculations avoid floating-point operations in WASM, using fixed-point basis point arithmetic and integer square root via Newton-Raphson approximation.
4. **Hardware Cryptography**: WebAuthn Passkey verification implements NIST P-256 (secp256r1) via the audited `p256` Rust crate, executing prehash ECDSA verification directly inside Stylus.

---

## License

This project is licensed under either the [MIT License](LICENSE) or the [Apache License 2.0](LICENSE) at your option.
