import { useState, useEffect } from "react";
import {
  Layers,
  Zap,
  Shield,
  Activity,
  Copy,
  Check,
  ExternalLink,
  Play,
  Pause,
  Cpu,
} from "lucide-react";
import type { OrbitL3Block } from "../types";

export function OrbitTopology() {
  const [selectedLayer, setSelectedLayer] = useState<"L1" | "L2" | "L3">("L3");
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);

  // Simulated 250ms live block generation
  const [blocks, setBlocks] = useState<OrbitL3Block[]>([
    {
      blockNumber: 1428904,
      timestamp: "Just now",
      txCount: 14,
      gasUsed: "124,800",
      hash: "0x7f8a9b2c...d4e5f601",
      prover: "Nitro-Orbit-DAC #1",
    },
    {
      blockNumber: 1428903,
      timestamp: "250ms ago",
      txCount: 9,
      gasUsed: "88,200",
      hash: "0x8a9b2c3d...e5f60123",
      prover: "Nitro-Orbit-DAC #3",
    },
    {
      blockNumber: 1428902,
      timestamp: "500ms ago",
      txCount: 22,
      gasUsed: "210,400",
      hash: "0x9b2c3d4e...f6012345",
      prover: "Nitro-Orbit-DAC #2",
    },
  ]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setBlocks((prev) => {
        const nextNum = prev[0].blockNumber + 1;
        const randomTx = Math.floor(Math.random() * 24) + 4;
        const randomGas = (randomTx * 9500 + Math.floor(Math.random() * 5000)).toLocaleString();
        const randomHash = "0x" + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join("") + "...f6" + Math.floor(Math.random() * 100);
        const randomProver = `Nitro-Orbit-DAC #${(nextNum % 4) + 1}`;

        const newBlock: OrbitL3Block = {
          blockNumber: nextNum,
          timestamp: "Just now",
          txCount: randomTx,
          gasUsed: randomGas,
          hash: randomHash,
          prover: randomProver,
        };
        return [newBlock, ...prev.slice(0, 5)];
      });
    }, 750);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const orbitConfigSnippet = `{
  "chain_name": "arbitrum-nexus-orbit-l3",
  "chain_id": 918237,
  "parent_chain_id": 421614,
  "data_availability": "AnyTrust",
  "block_time_ms": 250,
  "native_gas_token": "0x4A6b2F89b6c4A12B8964B01dFcB4F7Ff46F97C0b",
  "token_symbol": "NEXUS",
  "stylus_wasm_enabled": true,
  "dac_signers_threshold": 4,
  "dac_members_count": 6
}`;

  const handleCopyConfig = () => {
    navigator.clipboard.writeText(orbitConfigSnippet);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="nexus-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="rounded-xl border border-purple-400/30 bg-purple-500/10 p-2 text-purple-300">
                <Layers className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 sm:text-2xl">
                Arbitrum Orbit Layer 3 Topology
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">
              Scale autonomous AI agents with dedicated sub-second execution. Arbitrum Orbit lets developers
              deploy custom Layer 3 appchains settling directly to Arbitrum Sepolia or Arbitrum One,
              featuring custom gas tokens ($NEXUS), 250ms blocks, and native Stylus WASM acceleration.
            </p>
          </div>

          <div className="flex items-center space-x-3 rounded-xl border border-purple-500/30 bg-purple-950/40 p-4 font-mono text-xs">
            <div>
              <span className="text-slate-500 block">Orbit Finality</span>
              <span className="text-purple-300 font-bold text-lg">250 ms</span>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block">DA Protocol</span>
              <span className="text-emerald-400 font-bold text-lg">AnyTrust</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Tier Layer Architecture Diagram */}
      <div className="nexus-card rounded-2xl p-6 sm:p-8">
        <h3 className="mb-6 text-base font-bold text-slate-100 flex items-center space-x-2">
          <Activity className="h-4 w-4 text-purple-400" />
          <span>Interactive Hierarchical Settlement Stack</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* L1 Card */}
          <div
            onClick={() => setSelectedLayer("L1")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selectedLayer === "L1"
                ? "border-sky-400 bg-sky-950/30 shadow-lg shadow-sky-500/20"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                LAYER 1
              </span>
              <Shield className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-lg font-bold text-slate-100">Ethereum Mainnet</div>
            <div className="text-xs text-slate-400 mt-1">Ultimate Security & Root of Trust</div>

            <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-400">
              <div>Consensus: Proof of Stake</div>
              <div>Block Time: 12.0 seconds</div>
              <div>Finality: ~12.8 minutes</div>
            </div>
          </div>

          {/* L2 Card */}
          <div
            onClick={() => setSelectedLayer("L2")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selectedLayer === "L2"
                ? "border-arbitrum-blue bg-blue-950/30 shadow-lg shadow-arbitrum-blue/20"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                LAYER 2
              </span>
              <Zap className="h-4 w-4 text-arbitrum-blue" />
            </div>
            <div className="text-lg font-bold text-slate-100">Arbitrum Sepolia / One</div>
            <div className="text-xs text-slate-400 mt-1">Nitro Execution Engine + Rollup</div>

            <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-slate-400">
              <div>Settles to: Ethereum L1</div>
              <div>Block Time: 0.25 seconds</div>
              <div>VM: EVM + Stylus MultiVM</div>
            </div>
          </div>

          {/* L3 Card */}
          <div
            onClick={() => setSelectedLayer("L3")}
            className={`cursor-pointer rounded-2xl border p-5 transition-all ${
              selectedLayer === "L3"
                ? "border-purple-400 bg-purple-950/30 shadow-lg shadow-purple-500/20"
                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                LAYER 3 ORBIT
              </span>
              <Cpu className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-200">Nexus L3 Dedicated Appchain</div>
            <div className="text-xs text-slate-400 mt-1">Sub-second AI Micro-settlements</div>

            <div className="mt-4 space-y-1.5 border-t border-slate-800/80 pt-3 text-[11px] font-mono text-purple-300">
              <div>Settles to: Arbitrum Sepolia L2</div>
              <div>Block Time: 250 ms (Real-time)</div>
              <div>Gas Token: $NEXUS Custom ERC20</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live 250ms Block Streamer & Config Viewer Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Live 250ms Orbit Block Streamer */}
        <div className="nexus-card rounded-2xl p-6 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                    isStreaming ? "animate-ping" : ""
                  }`}
                />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <h3 className="text-base font-bold text-slate-100">
                Live Orbit L3 Block Stream (250ms)
              </h3>
            </div>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              {isStreaming ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-emerald-400" />
                  <span>Resume</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {blocks.map((block) => (
              <div
                key={block.blockNumber}
                className="flex flex-wrap items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/70 p-3 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-purple-300">
                    #{block.blockNumber.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500">{block.timestamp}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-slate-300">{block.txCount} txs</span>
                  <span className="text-slate-500">{block.gasUsed} gas</span>
                  <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] text-purple-300">
                    {block.prover}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Orbit Configuration Specification */}
        <div className="nexus-card rounded-2xl p-6 lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Orbit Genesis Config</h3>
            <button
              onClick={handleCopyConfig}
              className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:underline"
            >
              {copiedConfig ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-cyan-300">
            {orbitConfigSnippet}
          </pre>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Config source: <code className="text-purple-300">orbit/orbit-config.json</code></span>
            <a
              href="https://docs.arbitrum.io/launch-orbit-chain/orbit-quickstart"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>Orbit Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
