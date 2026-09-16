import React, { useState } from "react";
import {
  Coins,
  ShieldCheck,
  RefreshCw,
  Clock,
  CheckCircle2,
  Play,
  ExternalLink,
  Compass,
  Bot,
} from "lucide-react";
import type { Task, SolverAgent } from "../types";
import { ARBISCAN_EXPLORER_URL } from "../abi";

interface TaskMarketplaceProps {
  tasks: Task[];
  isLiveMode: boolean;
  isSubmittingTask: boolean;
  onInspectVector: (task: Task) => void;
  onSettleTask: (id: string) => void;
  onCreateTask: (params: {
    description: string;
    bounty: string;
    minScore: string;
    dimensions: string;
  }) => Promise<void>;
}

export function TaskMarketplace({
  tasks,
  isLiveMode,
  isSubmittingTask,
  onInspectVector,
  onSettleTask,
  onCreateTask,
}: TaskMarketplaceProps) {
  // Form state
  const [desc, setDesc] = useState("");
  const [bounty, setBounty] = useState("0.05");
  const [minScore, setMinScore] = useState("90.0");
  const [dims, setDims] = useState("512");
  const [filter, setFilter] = useState<"all" | "open" | "settled" | "onchain">("all");

  // Prompt Templates
  const promptTemplates = [
    {
      title: "DeFi Arbitrage Risk",
      desc: "Synthesize high-frequency arbitrage risk parameters for Pendle-USDC pool",
      dims: "128",
      bounty: "0.15",
      score: "92.0",
    },
    {
      title: "Orbit L3 Liquidity",
      desc: "Cross-chain liquidity depth model inference for Arbitrum One to Orbit L3",
      dims: "512",
      bounty: "0.25",
      score: "95.0",
    },
    {
      title: "DAO Governance Sentiment",
      desc: "Fine-tuned sentiment embedding vector for on-chain DAO governance proposal #42",
      dims: "1536",
      bounty: "0.40",
      score: "94.0",
    },
    {
      title: "Stylus Code Auditing",
      desc: "Neural embedding vector of Stylus Rust contract AST for reentrancy pattern matching",
      dims: "512",
      bounty: "0.20",
      score: "96.5",
    },
  ];

  // Active Autonomous Agents
  const activeAgents: SolverAgent[] = [
    {
      id: "agent-01",
      name: "Sentinel-01",
      role: "DeFi Arbitrage & Risk",
      address: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
      reputation: 99.4,
      tasksCompleted: 418,
      avgScore: 98.6,
      avgInkWasm: 3850,
      status: "active",
    },
    {
      id: "agent-02",
      name: "NeuroVector-Beta",
      role: "Governance & NLP",
      address: "0x56a1b2c3d4e5f60718293a4b5c6d7e8f90123456",
      reputation: 98.9,
      tasksCompleted: 273,
      avgScore: 97.4,
      avgInkWasm: 12400,
      status: "active",
    },
    {
      id: "agent-03",
      name: "KaggleOracle-X",
      role: "Cross-chain Depth",
      address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      reputation: 99.1,
      tasksCompleted: 612,
      avgScore: 99.1,
      avgInkWasm: 33800,
      status: "active",
    },
  ];

  const handleApplyTemplate = (t: typeof promptTemplates[0]) => {
    setDesc(t.desc);
    setDims(t.dims);
    setBounty(t.bounty);
    setMinScore(t.score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return;
    await onCreateTask({ description: desc, bounty, minScore, dimensions: dims });
    setDesc("");
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "open") return t.status === "open";
    if (filter === "settled") return t.status === "settled";
    if (filter === "onchain") return t.isLiveOnChain;
    return true;
  });

  const bountyNum = parseFloat(bounty) || 0.05;
  const bountyUsd = (bountyNum * 2850).toFixed(2);
  const estimatedStylusGas = parseInt(dims) * 22 + 1200;
  const estimatedEvmGas = parseInt(dims) * 850 + 22000;
  const gasSavings = (((estimatedEvmGas - estimatedStylusGas) / estimatedEvmGas) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Autonomous Agent Solvers Strip */}
      <div className="nexus-card rounded-2xl p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-100">
              Autonomous Stylus Agent Network
            </h3>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            3 Agents Online
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {activeAgents.map((ag) => (
            <div
              key={ag.id}
              className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition-all hover:border-sky-500/30"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-100">{ag.name}</span>
                </div>
                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                  {ag.role}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] font-mono border-t border-slate-900 pt-2">
                <div>
                  <div className="text-slate-500">Score</div>
                  <div className="font-bold text-cyan-300">{ag.avgScore}%</div>
                </div>
                <div>
                  <div className="text-slate-500">Tasks</div>
                  <div className="font-bold text-slate-200">{ag.tasksCompleted}</div>
                </div>
                <div>
                  <div className="text-slate-500">Avg Ink</div>
                  <div className="font-bold text-emerald-400">
                    {ag.avgInkWasm.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Post Escrow Form + Live Task Cards */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Post Compute Escrow Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="nexus-card rounded-2xl p-6 glow-box">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 text-arbitrum-blue">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Post Compute Escrow</h3>
                  <p className="text-xs text-slate-400">
                    {isLiveMode ? "Arbitrum Sepolia Live Contract" : "Stylus Sandbox Simulation"}
                  </p>
                </div>
              </div>

              {isLiveMode && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  On-Chain
                </span>
              )}
            </div>

            {/* Quick Template Selector */}
            <div className="mb-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick Task Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptTemplates.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(t)}
                    className="rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-[11px] text-slate-300 transition-colors hover:border-sky-500/40 hover:bg-sky-950/40"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Task Specification & Prompt
                </label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Generate prediction vector for cross-chain liquidity depth..."
                  className="w-full h-24 resize-none rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Bounty (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={bounty}
                    onChange={(e) => setBounty(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                  <div className="mt-1 text-[10px] text-slate-500 font-mono">
                    ≈ ${bountyUsd} USD
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Min. Match Threshold
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="50"
                    max="99.9"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                  <div className="mt-1 text-[10px] text-cyan-400 font-mono">
                    Cosine Score &gt;= {minScore}%
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Vector Model Dimensionality
                </label>
                <select
                  value={dims}
                  onChange={(e) => setDims(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="128">128 D (DeFi Risk & Statistical)</option>
                  <option value="512">512 D (Sentence BERT / Compact LLM)</option>
                  <option value="1536">1536 D (OpenAI Embedding-3 Small)</option>
                  <option value="2048">2048 D (Advanced Multimodal LLM)</option>
                </select>
              </div>

              {/* Dynamic Gas Estimate Box */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 font-mono text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Stylus WASM Cost:</span>
                  <strong className="text-emerald-400">{estimatedStylusGas.toLocaleString()} Ink</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Standard EVM Cost:</span>
                  <span className="line-through text-red-400/80">{estimatedEvmGas.toLocaleString()} Gas</span>
                </div>
                <div className="flex justify-between text-cyan-300 pt-1 border-t border-slate-800/80 text-[10px] font-bold">
                  <span>Stylus Compute Efficiency:</span>
                  <span>{gasSavings}% savings</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingTask}
                className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-arbitrum-blue to-cyan-400 py-3.5 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
              >
                {isSubmittingTask ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                    <span>Submitting On-Chain to Arbitrum Sepolia...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-slate-950" />
                    <span>
                      {isLiveMode ? "Lock Escrow on Arbitrum Sepolia" : "Lock Escrow on Stylus (Sandbox)"}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Tasks List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-100">Live AI Agent Tasks</h3>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
                {filteredTasks.length}
              </span>
            </div>

            <div className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
              <button
                onClick={() => setFilter("all")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  filter === "all" ? "bg-sky-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("open")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  filter === "open" ? "bg-sky-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Open Bounties
              </button>
              <button
                onClick={() => setFilter("settled")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  filter === "settled" ? "bg-sky-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Settled
              </button>
              <button
                onClick={() => setFilter("onchain")}
                className={`rounded px-2.5 py-1 transition-colors ${
                  filter === "onchain" ? "bg-sky-500/20 text-cyan-300 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                On-Chain
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const isSettled = task.status === "settled";

              return (
                <div
                  key={task.id}
                  className="nexus-card nexus-card-interactive rounded-2xl p-5 space-y-3 relative overflow-hidden"
                >
                  {/* Top Row: Meta Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                        {task.id.slice(0, 10)}...{task.id.slice(-4)}
                      </span>

                      {task.isLiveOnChain && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          On-Chain
                        </span>
                      )}

                      <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
                        {task.vectorDimensions}D
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isSettled ? (
                        <span className="flex items-center space-x-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Settled ({task.achievedScore}%)</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Open for Bidding</span>
                        </span>
                      )}

                      <span className="rounded-full border border-cyan-400/30 bg-cyan-500/15 px-3 py-0.5 font-mono text-xs font-bold text-cyan-300">
                        {task.bounty} ETH
                      </span>
                    </div>
                  </div>

                  {/* Task Description */}
                  <p className="text-xs text-slate-200 leading-relaxed">{task.description}</p>

                  {/* Score Meter (if settled or open) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>Threshold: &gt;={task.minScore}%</span>
                      {isSettled && (
                        <span className="text-emerald-400 font-bold">
                          Achieved: {task.achievedScore}%
                        </span>
                      )}
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden flex">
                      <div
                        style={{ width: `${task.minScore}%` }}
                        className="bg-sky-500/40 border-r border-sky-400"
                        title={`Threshold: ${task.minScore}%`}
                      />
                      {isSettled && task.achievedScore && (
                        <div
                          style={{ width: `${Math.max(0, task.achievedScore - task.minScore)}%` }}
                          className="bg-emerald-400"
                          title={`Achieved: ${task.achievedScore}%`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-3 gap-2">
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>
                        Creator: <code className="text-slate-300">{task.creator.slice(0, 6)}...{task.creator.slice(-4)}</code>
                      </span>

                      {task.txHash && (
                        <a
                          href={`${ARBISCAN_EXPLORER_URL}/tx/${task.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1 text-cyan-400 hover:underline"
                        >
                          <span>Arbiscan</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Inspect Vector Alignment Button */}
                      <button
                        onClick={() => onInspectVector(task)}
                        className="flex items-center space-x-1.5 rounded-lg border border-sky-500/30 bg-sky-950/40 px-3 py-1.5 text-xs font-semibold text-sky-200 transition-colors hover:bg-sky-900/40 hover:border-cyan-400"
                      >
                        <Compass className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Inspect Alignment</span>
                      </button>

                      {/* Settle Action Button */}
                      {task.status === "open" && (
                        <button
                          onClick={() => onSettleTask(task.id)}
                          className="flex items-center space-x-1.5 rounded-lg bg-gradient-to-r from-arbitrum-blue to-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 transition-all hover:opacity-95 shadow-md shadow-cyan-500/20 active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Dispatch Agent</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
