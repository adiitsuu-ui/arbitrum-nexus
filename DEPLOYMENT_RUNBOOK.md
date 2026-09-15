# 🚀 Arbitrum Stylus Agent Nexus: Production & Testnet Deployment Runbook

This runbook guides operators and developers through deploying the **Arbitrum Stylus Agent Nexus (`arbitrum-nexus`)** protocol from scratch to **Arbitrum Sepolia Testnet**, **Arbitrum One Mainnet**, or a dedicated **Arbitrum Orbit Layer 3 App-Chain**.

---

## 📋 External Resources & Credentials Checklist

Before deploying live on-chain, ensure you have gathered the following:

| Resource | Purpose | Recommended Providers / URLs |
| :--- | :--- | :--- |
| **Arbitrum Sepolia RPC** | Interacting with testnet blockchain | Public: `https://sepolia-rollup.arbitrum.io/rpc`<br>Or private: [Alchemy](https://alchemy.com), [QuickNode](https://quicknode.com), [Infura](https://infura.io) |
| **Funded Private Key (Deployer)** | Pays gas for contract deployment & Stylus activation (~0.05 Sepolia ETH) | [Chainlink Arbitrum Sepolia Faucet](https://faucets.chain.link/arbitrum-sepolia)<br>[LearnWeb3 Faucet](https://learnweb3.io/faucets/arbitrum_sepolia/) |
| **Funded Private Key (Agent)** | Autonomous worker wallet to submit on-chain settlements & receive bounties | Same faucets as above |
| **`cargo-stylus` CLI** | Rust CLI for compiling, checking, and deploying WASM programs to Stylus | Install via: `cargo install --locked cargo-stylus` |
| **Rust WASM Target** | Cross-compilation target for smart contracts | Install via: `rustup target add wasm32-unknown-unknown` |
| **Arbiscan API Key** | Optional: Smart contract verification on block explorer | [Sepolia Arbiscan](https://sepolia.arbiscan.io/myapikey) |
| **Web3 Browser Wallet** | Interacting with the Frontend Command Center | [MetaMask](https://metamask.io), [Rabby Wallet](https://rabby.io) |
| **Web Hosting Provider** | Hosting the static frontend application | [Vercel](https://vercel.com), [Cloudflare Pages](https://pages.cloudflare.com) |

---

## 🛠️ Step 1: Stylus Smart Contracts (Rust WASM)

The Stylus smart contracts are located in `contracts/`. They provide:
- High-performance NIST P-256 (WebAuthn / Passkey) signature verification in native WASM.
- Mathematical vector cosine similarity calculation for neural embeddings.
- Non-custodial AI compute escrow settlement.

### 1.1 Verify Local Tests & WASM Compilation
```bash
cd contracts

# 1. Run unit test suite (crypto + vector math)
cargo test --lib

# 2. Compile to release WASM (output: target/wasm32-unknown-unknown/release/stylus_nexus_contracts.wasm)
cargo build --target wasm32-unknown-unknown --release --no-default-features
```

### 1.2 Export Solidity Interface (Optional)
To regenerate or inspect the auto-generated Solidity interface:
```bash
cargo run --bin stylus-nexus-contracts --features export-abi > IStylusNexus.sol
```

### 1.3 Install `cargo-stylus` CLI
If not already installed:
```bash
cargo install --locked cargo-stylus
```

### 1.4 Configure Environment Variables
Copy `contracts/.env.example` to `contracts/.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
ARBITRUM_SEPOLIA_RPC="https://sepolia-rollup.arbitrum.io/rpc"
DEPLOYER_PRIVATE_KEY="0xYOUR_FUNDED_PRIVATE_KEY_HERE"
```

### 1.5 Verify Contract Compatibility on Arbitrum Stylus
Run `cargo stylus check` to simulate on-chain activation:
```bash
cargo stylus check \
  --wasm-file-path target/wasm32-unknown-unknown/release/stylus_nexus_contracts.wasm \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```
Expected output:
```
Program is valid Stylus code!
Estimated activation fee: ~0.002 ETH
```

### 1.6 Deploy Contract
Run the automated deployment script or invoke `cargo stylus deploy`:
```bash
# Using the automated deployment script:
./scripts/deploy.sh

# Or directly via cargo stylus:
cargo stylus deploy \
  --wasm-file-path target/wasm32-unknown-unknown/release/stylus_nexus_contracts.wasm \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc \
  --private-key $DEPLOYER_PRIVATE_KEY
```
Note the printed contract address (active deployment: `0xEE48074c6Db89E15d7DE7C6eF538a6799872A1b9`). Save this address for the Agent and Frontend configurations.

---

## 🤖 Step 2: Autonomous AI Agent Worker

The agent worker is located in `agent/`. It runs on Bun, monitors the Stylus contract for `TaskCreated` events, generates candidate vector embeddings, verifies accuracy locally, and settles tasks on-chain via `settleAiTask()`.

### 2.1 Install Dependencies & Typecheck
```bash
cd agent
bun install
bun run typecheck
```

### 2.2 Run the Quantitative Gas Benchmark
To verify Stylus vs EVM gas savings:
```bash
bun run benchmark
```

### 2.3 Configure Agent Environment
Copy `agent/.env.example` to `agent/.env`:
```bash
cp .env.example .env
```
Edit `.env`:
```ini
ARBITRUM_RPC_URL="https://sepolia-rollup.arbitrum.io/rpc"
STYLUS_CONTRACT_ADDRESS="0xYOUR_DEPLOYED_CONTRACT_ADDRESS"
AGENT_PRIVATE_KEY="0xYOUR_AGENT_WALLET_PRIVATE_KEY"
POLL_INTERVAL_MS="5000"
```

### 2.4 Run the Agent Worker
```bash
# Single evaluation run (processes pending tasks and demo batch):
bun run agent

# Continuous daemon mode (actively listens for on-chain events):
bun run src/agent.ts --daemon
```

### 2.5 Production Daemon (PM2 / Systemd)
To run the agent continuously in production with automatic restart:
```bash
# Using PM2
bun add -g pm2
pm2 start "bun run src/agent.ts --daemon" --name "stylus-sentinel-agent"
pm2 logs stylus-sentinel-agent
pm2 save
```

---

## 💻 Step 3: Frontend Command Center

The web dashboard is built with Vite, React, TailwindCSS, and Viem. It includes:
- Multi-mode support: **Demo Sandbox** and **Live Arbitrum Sepolia Testnet**.
- Web3 wallet connection with network auto-switching.
- Native biometric WebAuthn Passkey (Touch ID / Face ID) signing.
- Live escrow submission to the Stylus smart contract.
- Interactive vector efficiency simulator.

### 3.1 Configure Environment Variables
Copy `frontend/.env.example` to `frontend/.env`:
```bash
cd frontend
cp .env.example .env
```
Edit `frontend/.env`:
```ini
VITE_STYLUS_CONTRACT_ADDRESS="0xYOUR_DEPLOYED_CONTRACT_ADDRESS"
VITE_ARBITRUM_SEPOLIA_RPC="https://sepolia-rollup.arbitrum.io/rpc"
VITE_CHAIN_ID="421614"
VITE_ARBISCAN_EXPLORER_URL="https://sepolia.arbiscan.io"
```

### 3.2 Build & Preview
```bash
# Build for production (runs tsc && vite build)
bun run build

# Preview production build locally
bun run preview
```

### 3.3 Deploying Frontend to Production

#### Deploy to Vercel:
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
cd frontend
vercel deploy --prod
```
In the Vercel dashboard, add the environment variables from `frontend/.env`.

#### Deploy to Cloudflare Pages:
```bash
cd frontend
bun run build
# Deploy the 'dist' directory via Cloudflare Dashboard or Wrangler CLI
npx wrangler pages deploy dist --project-name arbitrum-nexus
```

---

## 🪐 Step 4: Arbitrum Orbit Layer 3 App-Chain (Optional)

To scale the Nexus protocol into a dedicated private or high-throughput Layer 3:
1. Inspect `orbit/orbit-config.json` for the chain specification (Chain ID: `918237`, Block Time: `250ms`, DA: `AnyTrust`).
2. Follow `orbit/README.md` to launch a local Nitro node or deploy with the [Arbitrum Orbit Deployment Portal](https://orbit.arbitrum.io).
3. Point `contracts/.env`, `agent/.env`, and `frontend/.env` to the Orbit RPC (`http://localhost:8449` or your hosted sequencer endpoint).

---

## 🔍 Troubleshooting & FAQs

### Q: `cargo stylus check` fails with "Program size exceeds limit"
- Ensure you compiled with `--release --no-default-features`.
- The `Cargo.toml` release profile uses `opt-level = "z"`, `lto = true`, and `codegen-units = 1` for maximum compression.

### Q: `Transaction reverted: Payout transfer failed`
- When calling `settleAiTask()`, the contract transfers locked ETH to the agent.
- Ensure the contract has enough native ETH (funded by the creator upon `createTask()`).

### Q: WebAuthn prompt does not appear in browser
- WebAuthn requires a secure context (`https://` or `http://localhost`).
- If hardware passkeys are unavailable or cancelled by the user, the dashboard automatically engages the secure enclave fallback simulation for seamless testing.
