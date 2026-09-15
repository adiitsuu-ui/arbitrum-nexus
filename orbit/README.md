# Arbitrum Orbit L3 App-Chain Blueprint: Nexus Chain

This blueprint defines the architecture and configuration for deploying a dedicated **Layer 3 Orbit Chain** settling on **Arbitrum Sepolia** (or Arbitrum One in production).

## Key Superpowers of this Orbit L3:
1. **Stylus Enabled (`EnableStylus: true`)**: Run Rust/WASM smart contracts with 10x-100x efficiency directly on your dedicated chain.
2. **Sub-second Block Times (250ms)**: Near-instant execution for high-frequency AI agent coordination and transactions.
3. **AnyTrust Data Availability**: Eliminates costly L1 Ethereum calldata fees, providing micro-cent transaction fees.
4. **Custom Gas Token (`$NEXUS`)**: Native gas fees paid in the protocol's own ecosystem token rather than ETH.

## Deployment Instructions

### 1. Prerequisites
- Docker & Docker Compose
- Arbitrum Nitro node binaries (`offchainlabs/nitro-node:v3.0.0`)
- An Ethereum private key funded with testnet ETH on **Arbitrum Sepolia** (Chain ID: `421614`).

### 2. Deploy Contracts via Orbit Deployment SDK
```bash
# Clone the Arbitrum Orbit deployment tools
git clone https://github.com/OffchainLabs/orbit-setup-script.git
cd orbit-setup-script

# Copy the custom orbit configuration
cp ../orbit/orbit-config.json config.json

# Run deployment script targeting Arbitrum Sepolia
npm run setup:l3 -- --parent-rpc="https://sepolia-rollup.arbitrum.io/rpc"
```

### 3. Launch Local L3 Sequencer Node (Turnkey)

Use the automated launch script or Docker Compose directly:

```bash
# Launch via helper script
./orbit/launch-orbit.sh

# Or start directly with Docker Compose:
cd orbit
docker compose up -d
```

Check node health and logs:
```bash
# View live sequencer logs
./orbit/launch-orbit.sh logs

# Check container status
./orbit/launch-orbit.sh status

# Stop the node
./orbit/launch-orbit.sh stop
```

Your L3 RPC will be live at `http://localhost:8547` (WebSocket: `ws://localhost:8548`) with Chain ID `918237`.

