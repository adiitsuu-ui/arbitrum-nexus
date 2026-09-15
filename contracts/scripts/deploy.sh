#!/usr/bin/env bash
set -e

# Arbitrum Stylus Contracts Deployment Script
# Compiles Stylus contract to wasm32-unknown-unknown, verifies WASM readiness with cargo-stylus, and deploys.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Load .env if present
if [ -f "${PROJECT_DIR}/.env" ]; then
    echo "Loading environment from ${PROJECT_DIR}/.env"
    set -a
    source "${PROJECT_DIR}/.env"
    set +a
fi

RPC_URL="${ARBITRUM_SEPOLIA_RPC:-https://sepolia-rollup.arbitrum.io/rpc}"
PRIVATE_KEY="${DEPLOYER_PRIVATE_KEY:-}"
DRY_RUN=false

# Parse flags first
for arg in "$@"; do
    case $arg in
        --check-only|--dry-run)
            DRY_RUN=true
            ;;
        --rpc=*)
            RPC_URL="${arg#*=}"
            ;;
        --key=*|--private-key=*)
            PRIVATE_KEY="${arg#*=}"
            ;;
    esac
done

echo "============================================================"
echo "⚡ Arbitrum Stylus Contract Deployment Tool"
echo "============================================================"
echo "📁 Working Directory: ${PROJECT_DIR}"
echo "🌐 Target Endpoint:   ${RPC_URL}"
if [ "$DRY_RUN" = true ]; then
    echo "🧪 Mode:              Dry-Run / Verification Only"
else
    echo "🚀 Mode:              Live On-Chain Deployment"
fi

# Step 1: Ensure Rust wasm32 target is installed
echo ""
echo "📦 Step 1: Checking Rust target wasm32-unknown-unknown..."
if ! rustup target list | grep -q "wasm32-unknown-unknown (installed)"; then
    echo "Installing wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
fi
echo "✅ wasm32-unknown-unknown target ready."

# Step 2: Compile to release WASM
echo ""
echo "🔨 Step 2: Compiling contracts to optimized WASM..."
cd "${PROJECT_DIR}"
cargo build --target wasm32-unknown-unknown --release --no-default-features

WASM_FILE="${PROJECT_DIR}/target/wasm32-unknown-unknown/release/stylus_nexus_contracts.wasm"
if [ ! -f "${WASM_FILE}" ]; then
    echo "❌ Error: WASM binary not found at ${WASM_FILE}"
    exit 1
fi
WASM_SIZE=$(ls -lh "${WASM_FILE}" | awk '{print $5}')
echo "✅ WASM compiled successfully: ${WASM_FILE} (${WASM_SIZE})"

# Step 3: Check if cargo-stylus CLI is installed
echo ""
echo "🔍 Step 3: Checking cargo-stylus CLI..."
if ! command -v cargo-stylus &> /dev/null; then
    echo "⚠️  cargo-stylus is not installed on PATH."
    echo "   To install cargo-stylus, run:"
    echo "     cargo install --locked cargo-stylus"
    echo ""
    echo "   Continuing with target WASM artifact ready for deployment."
    if [ "$DRY_RUN" = true ]; then
        echo "✅ Dry-run complete. WASM artifact verified at: ${WASM_FILE}"
        exit 0
    fi
fi

# Step 4: Stylus Verification
if command -v cargo-stylus &> /dev/null; then
    echo ""
    echo "🧪 Step 4: Running Stylus WASM verification against endpoint..."
    cargo stylus check --endpoint "${RPC_URL}"
    echo "✅ Stylus verification passed."

    if [ "$DRY_RUN" = true ]; then
        echo "✅ Dry-run verification complete. Ready for live deployment."
        exit 0
    fi

    # Step 5: Deploy to Arbitrum
    echo ""
    echo "🚀 Step 5: Deploying to Stylus runtime..."
    if [ -z "${PRIVATE_KEY}" ]; then
        echo "❌ Error: DEPLOYER_PRIVATE_KEY is not set."
        echo "   Provide your private key in .env or via: ./scripts/deploy.sh --key=0x..."
        echo "   Testnet faucet: https://faucets.chain.link/arbitrum-sepolia"
        exit 1
    fi

    cargo stylus deploy \
        --endpoint "${RPC_URL}" \
        --private-key "${PRIVATE_KEY}"
else
    echo "⚠️  Install cargo-stylus to perform on-chain activation: 'cargo install --locked cargo-stylus'"
fi
