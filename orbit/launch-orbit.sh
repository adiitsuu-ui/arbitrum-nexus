#!/usr/bin/env bash
set -e

# ==============================================================================
# Arbitrum Orbit L3 Turnkey Deployment Helper
# Launches a local Nitro Sequencer node for Nexus Chain (Chain ID: 918237)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/orbit-config.json"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"

echo "=================================================================="
echo "🪐 Arbitrum Orbit Layer 3: Nexus Chain Local Sequencer Launcher"
echo "=================================================================="

# Check Docker prerequisite
if ! command -v docker &> /dev/null; then
    echo "❌ Error: docker is not installed or not available on PATH."
    echo "   Please install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Detect docker compose CLI syntax
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "❌ Error: neither 'docker compose' nor 'docker-compose' was found."
    exit 1
fi

if [ ! -f "${CONFIG_FILE}" ]; then
    echo "❌ Error: Config file not found at ${CONFIG_FILE}"
    exit 1
fi

echo "📋 Configuration File: ${CONFIG_FILE}"
echo "🐳 Docker Compose:     ${COMPOSE_FILE}"
echo "🌐 Parent Chain:       Arbitrum Sepolia (Chain ID: 421614)"
echo "⛓️  Target L3 Chain ID: 918237 (Block Time: 250ms, AnyTrust DA)"

case "${1:-}" in
    down|stop)
        echo "🛑 Stopping Orbit Sequencer container..."
        cd "${SCRIPT_DIR}" && $DOCKER_COMPOSE -f "${COMPOSE_FILE}" down
        echo "✅ Orbit node stopped."
        exit 0
        ;;
    logs)
        cd "${SCRIPT_DIR}" && $DOCKER_COMPOSE -f "${COMPOSE_FILE}" logs -f
        exit 0
        ;;
    status)
        cd "${SCRIPT_DIR}" && $DOCKER_COMPOSE -f "${COMPOSE_FILE}" ps
        exit 0
        ;;
esac

echo ""
echo "🚀 Bootstrapping Arbitrum Orbit Layer 3 Sequencer..."
cd "${SCRIPT_DIR}"
$DOCKER_COMPOSE -f "${COMPOSE_FILE}" up -d

echo ""
echo "=================================================================="
echo "✨ Nexus Orbit L3 node container launched successfully!"
echo "=================================================================="
echo "📡 Local HTTP RPC:  http://localhost:8547"
echo "🔌 Local WS URL:    ws://localhost:8548"
echo "🆔 Chain ID:        918237"
echo "⛽ Native Gas:      \$NEXUS"
echo ""
echo "Helpful commands:"
echo "  Inspect logs:     ./orbit/launch-orbit.sh logs"
echo "  Check status:     ./orbit/launch-orbit.sh status"
echo "  Stop container:   ./orbit/launch-orbit.sh stop"
echo "=================================================================="
