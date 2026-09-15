#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load .env if present
if [ -f "${PROJECT_DIR}/.env" ]; then
    set -a
    source "${PROJECT_DIR}/.env"
    set +a
fi

RPC_URL="${ARBITRUM_SEPOLIA_RPC:-https://sepolia-rollup.arbitrum.io/rpc}"
ADDRESS="${DEPLOYER_ADDRESS:-0xCb3F3B578dfc1C5d4d70ac450bAd38AC26931b96}"
PRIVATE_KEY="${DEPLOYER_PRIVATE_KEY:-}"

if [ -z "${PRIVATE_KEY}" ]; then
    echo "❌ Error: DEPLOYER_PRIVATE_KEY must be set in environment or contracts/.env"
    exit 1
fi

echo "⏳ Waiting for bridged ETH (0.05 ETH) to land on Arbitrum Sepolia..."
echo "📍 Target Address: ${ADDRESS}"

start_time=$(date +%s)
while true; do
    bal_hex=$(curl -s -X POST -H "Content-Type: application/json" \
      --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"${ADDRESS}\", \"latest\"],\"id\":1}" \
      "${RPC_URL}" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$bal_hex" ] && [ "$bal_hex" != "0x0" ] && [ "$bal_hex" != "0x" ]; then
        echo ""
        echo "🎉 FUNDS DETECTED ON ARBITRUM SEPOLIA! Balance: ${bal_hex}"
        break
    fi

    now=$(date +%s)
    elapsed=$((now - start_time))
    printf "\rWaiting for sequencer... (%ds elapsed)" "$elapsed"

    if [ "$elapsed" -gt 900 ]; then
        echo "\nTimeout waiting for deposit."
        exit 1
    fi
    sleep 10
done

echo ""
echo "🚀 BROADCASTING LIVE STYLUS DEPLOYMENT TRANSACTION..."
cd "${PROJECT_DIR}"

cargo stylus deploy \
    --endpoint "${RPC_URL}" \
    --private-key "${PRIVATE_KEY}"

echo ""
echo "✨ DEPLOYMENT COMPLETED SUCCESSFULLY!"
