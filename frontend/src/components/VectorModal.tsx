import { useState } from "react";
import {
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Compass,
} from "lucide-react";
import type { Task } from "../types";
import { verifyVectorSimilarityOnChain } from "../web3";
import { DEFAULT_CONTRACT_ADDRESS, ARBISCAN_EXPLORER_URL } from "../abi";

interface VectorModalProps {
  task: Task | null;
  onClose: () => void;
}

export function VectorModal({ task, onClose }: VectorModalProps) {
  if (!task) return null;

  // Generate 8 representative dimensions for the radar visualization
  const [refVector] = useState<number[]>([
    85, 70, 92, 60, 78, 95, 88, 75,
  ]);
  const [candVector, setCandVector] = useState<number[]>([
    83, 72, 90, 64, 76, 94, 86, 73,
  ]);
  const [viewMode, setViewMode] = useState<"radar" | "spectrum">("radar");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isVerifyingOnChain, setIsVerifyingOnChain] = useState(false);
  const [onChainResult, setOnChainResult] = useState<{
    isPassing: boolean;
    scoreBps: number;
    blockNumber: bigint | null;
    latencyMs: number;
  } | null>(null);

  const handleVerifyOnChain = async () => {
    setIsVerifyingOnChain(true);
    try {
      // Scale coordinates to integer vectors for int32[] ABI
      const vecA = refVector.map((v) => Math.round(v * 100));
      const vecB = candVector.map((v) => Math.round(v * 100));
      const minThresholdBps = Math.round(task.minScore * 100);

      const res = await verifyVectorSimilarityOnChain(vecA, vecB, minThresholdBps);
      setOnChainResult(res);
    } catch (err) {
      console.error("Failed on-chain verification:", err);
    } finally {
      setIsVerifyingOnChain(false);
    }
  };

  // Compute real cosine similarity, distance, and angle
  const computeMetrics = (vecA: number[], vecB: number[]) => {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    const cosSim = denom === 0 ? 0 : dot / denom;
    const boundedSim = Math.min(1, Math.max(0, cosSim));
    const scorePct = boundedSim * 100;
    const distance = 1 - boundedSim;
    const angleRad = Math.acos(boundedSim);
    const angleDeg = (angleRad * 180) / Math.PI;

    return {
      scorePct: Number(scorePct.toFixed(2)),
      distance: Number(distance.toFixed(4)),
      angleDeg: Number(angleDeg.toFixed(2)),
      dotProduct: Math.round(dot),
      normA: Number(Math.sqrt(normA).toFixed(1)),
      normB: Number(Math.sqrt(normB).toFixed(1)),
    };
  };

  const metrics = computeMetrics(refVector, candVector);
  const isPassing = metrics.scorePct >= task.minScore;

  // Inject noise
  const handleInjectNoise = () => {
    setCandVector((prev) =>
      prev.map((val) => {
        const delta = (Math.random() - 0.5) * 35;
        return Math.max(20, Math.min(100, Math.round(val + delta)));
      })
    );
  };

  // Run simulated optimization
  const handleOptimize = () => {
    setIsOptimizing(true);
    let step = 0;
    const interval = setInterval(() => {
      setCandVector((prev) =>
        prev.map((val, idx) => {
          const target = refVector[idx];
          const diff = target - val;
          return Math.round(val + diff * 0.4 + (Math.random() - 0.5) * 2);
        })
      );
      step++;
      if (step >= 5) {
        clearInterval(interval);
        setIsOptimizing(false);
      }
    }, 180);
  };

  // Calculate Radar polygon SVG coordinates
  const radarRadius = 110;
  const centerX = 150;
  const centerY = 150;
  const numAxes = refVector.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const refPoints = refVector
    .map((val, idx) => {
      const { x, y } = getCoordinates(val, idx);
      return `${x},${y}`;
    })
    .join(" ");

  const candPoints = candVector
    .map((val, idx) => {
      const { x, y } = getCoordinates(val, idx);
      return `${x},${y}`;
    })
    .join(" ");

  const estimatedInk = task.vectorDimensions * 22 + 1200;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="nexus-card-glow relative w-full max-w-3xl overflow-hidden rounded-2xl border border-sky-500/30 bg-arbitrum-obsidian shadow-2xl shadow-cyan-950/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-500/20 bg-arbitrum-navy/70 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-2 text-cyan-300">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  Stylus Vector Alignment Comparator
                </h3>
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
                  {task.vectorDimensions}D WASM Vector
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time cosine similarity calculation evaluated via Rust math
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Top Score Banner */}
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="nexus-card rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Cosine Similarity</div>
              <div
                className={`text-2xl font-black ${
                  isPassing ? "text-cyan-300" : "text-amber-400"
                }`}
              >
                {metrics.scorePct}%
              </div>
              <div className="text-[10px] text-slate-500">Min: {task.minScore}%</div>
            </div>

            <div className="nexus-card rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Cosine Distance</div>
              <div className="text-2xl font-black font-mono text-purple-300">
                {metrics.distance}
              </div>
              <div className="text-[10px] text-slate-500">1 - cos(θ)</div>
            </div>

            <div className="nexus-card rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Vector Angle (θ)</div>
              <div className="text-2xl font-black font-mono text-sky-300">
                {metrics.angleDeg}°
              </div>
              <div className="text-[10px] text-slate-500">Angular divergence</div>
            </div>

            <div className="nexus-card rounded-xl p-3 text-center">
              <div className="text-[11px] font-semibold text-slate-400">Stylus Gas / Ink</div>
              <div className="text-2xl font-black font-mono text-emerald-400">
                {estimatedInk.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500">&lt;$0.00005 USD</div>
            </div>
          </div>

          {/* Main Visualizer Area */}
          <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
            {/* Visualizer SVG */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-sky-500/20 bg-slate-950/70 p-4 md:col-span-7">
              {/* View Toggle */}
              <div className="mb-3 flex space-x-1 rounded-lg border border-slate-800 bg-slate-900 p-1 text-xs">
                <button
                  onClick={() => setViewMode("radar")}
                  className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                    viewMode === "radar"
                      ? "bg-sky-500/20 text-cyan-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Radar Polygon
                </button>
                <button
                  onClick={() => setViewMode("spectrum")}
                  className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                    viewMode === "spectrum"
                      ? "bg-sky-500/20 text-cyan-300"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Dimension Spectrum
                </button>
              </div>

              {viewMode === "radar" ? (
                <div className="relative">
                  <svg width="300" height="300" className="overflow-visible">
                    {/* Concentric guide circles */}
                    {[0.25, 0.5, 0.75, 1.0].map((level, idx) => (
                      <circle
                        key={idx}
                        cx={centerX}
                        cy={centerY}
                        r={radarRadius * level}
                        fill="none"
                        stroke="#1e293b"
                        strokeDasharray={idx < 3 ? "3 3" : "none"}
                        strokeWidth="1"
                      />
                    ))}

                    {/* Radial axes */}
                    {refVector.map((_, idx) => {
                      const { x, y } = getCoordinates(100, idx);
                      return (
                        <line
                          key={idx}
                          x1={centerX}
                          y1={centerY}
                          x2={x}
                          y2={y}
                          stroke="#1e293b"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Reference Vector Polygon (Cyan) */}
                    <polygon
                      points={refPoints}
                      fill="rgba(40, 160, 240, 0.25)"
                      stroke="#28A0F0"
                      strokeWidth="2"
                    />

                    {/* Candidate Vector Polygon (Neon / Emerald) */}
                    <polygon
                      points={candPoints}
                      fill={
                        isPassing
                          ? "rgba(32, 201, 151, 0.35)"
                          : "rgba(251, 146, 60, 0.35)"
                      }
                      stroke={isPassing ? "#00E5FF" : "#F97316"}
                      strokeWidth="2.5"
                      className="transition-all duration-300"
                    />

                    {/* Points on Candidate Vector */}
                    {candVector.map((val, idx) => {
                      const { x, y } = getCoordinates(val, idx);
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="3.5"
                          fill={isPassing ? "#00E5FF" : "#F97316"}
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {/* Center Core */}
                    <circle cx={centerX} cy={centerY} r="3" fill="#38bdf8" />
                  </svg>

                  {/* Legend */}
                  <div className="mt-2 flex items-center justify-center space-x-6 text-[11px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-sky-500"></span>
                      <span className="text-slate-300">Prompt Vector (A)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-sm ${
                          isPassing ? "bg-cyan-400" : "bg-orange-500"
                        }`}
                      ></span>
                      <span className="text-slate-300">Agent Vector (B)</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dimension Spectrum Bars */
                <div className="w-full space-y-2 py-2">
                  {refVector.map((valA, idx) => {
                    const valB = candVector[idx];
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between font-mono text-[10px] text-slate-400">
                          <span>Dim #{idx + 1}</span>
                          <span>
                            A: {valA} | B: {valB}
                          </span>
                        </div>
                        <div className="flex h-2 w-full overflow-hidden rounded bg-slate-900">
                          <div
                            style={{ width: `${valA}%` }}
                            className="bg-sky-500/70"
                          />
                          <div
                            style={{ width: `${valB}%` }}
                            className={`ml-1 ${
                              isPassing ? "bg-cyan-400" : "bg-orange-400"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Controls & Formula Breakdown */}
            <div className="space-y-4 md:col-span-5">
              {/* Status Box */}
              <div
                className={`rounded-xl border p-4 ${
                  isPassing
                    ? "border-emerald-500/30 bg-emerald-950/30"
                    : "border-amber-500/30 bg-amber-950/30"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {isPassing ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  )}
                  <span
                    className={`font-bold ${
                      isPassing ? "text-emerald-300" : "text-amber-300"
                    }`}
                  >
                    {isPassing ? "Threshold Verified" : "Below Required Threshold"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {isPassing
                    ? `Achieved ${metrics.scorePct}% match. Stylus settlement function will release ${task.bounty} ETH bounty to agent.`
                    : `Achieved ${metrics.scorePct}% < required ${task.minScore}%. Task remains open or agent must refine weights.`}
                </p>
              </div>

              {/* Interactive Controls */}
              <div className="space-y-2">
                <button
                  onClick={handleInjectNoise}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl border border-sky-500/30 bg-sky-950/40 py-2.5 text-xs font-bold text-sky-200 transition-colors hover:bg-sky-900/40"
                >
                  <RefreshCw className="h-4 w-4 text-cyan-400" />
                  <span>Inject Random Perturbation (Noise)</span>
                </button>

                <button
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-arbitrum-blue to-cyan-400 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition-all hover:opacity-95 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-slate-950" />
                  <span>
                    {isOptimizing
                      ? "Optimizing Alignment..."
                      : "Run Gradient Alignment (AI Refinement)"}
                  </span>
                </button>

                {/* Live Stylus WASM Verification Button */}
                <button
                  onClick={handleVerifyOnChain}
                  disabled={isVerifyingOnChain}
                  className="flex w-full items-center justify-center space-x-2 rounded-xl border border-emerald-500/40 bg-emerald-950/50 py-2.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-900/50 hover:border-emerald-400 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 text-emerald-400 ${isVerifyingOnChain ? "animate-spin" : ""}`} />
                  <span>
                    {isVerifyingOnChain
                      ? "Querying Stylus Contract..."
                      : "⚡ Verify on Arbitrum Sepolia Contract"}
                  </span>
                </button>
              </div>

              {/* On-Chain Verification Proof Card */}
              {onChainResult && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3 font-mono text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-emerald-300 font-bold">
                    <span>Stylus WASM Verification:</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px]">
                      {onChainResult.isPassing ? "PASSED ✅" : "FAILED ❌"}
                    </span>
                  </div>
                  <div className="text-slate-300">
                    On-chain Score: <strong className="text-cyan-300">{(onChainResult.scoreBps / 100).toFixed(2)}%</strong> ({onChainResult.scoreBps} bps)
                  </div>
                  <div className="text-slate-400 text-[10px] flex justify-between">
                    <span>Block: #{onChainResult.blockNumber?.toString() || "latest"}</span>
                    <span>RPC Latency: {onChainResult.latencyMs}ms</span>
                  </div>
                  <div className="text-[10px] pt-1 border-t border-emerald-500/20">
                    <a
                      href={`${ARBISCAN_EXPLORER_URL}/address/${DEFAULT_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 underline hover:text-cyan-300"
                    >
                      View Stylus Verifier Contract on Arbiscan &rarr;
                    </a>
                  </div>
                </div>
              )}

              {/* Monospace Formula Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-3 font-mono text-[11px] text-slate-400 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Stylus Cosine Formula:
                </div>
                <div className="text-cyan-300">
                  cos(θ) = (A · B) / (||A|| × ||B||)
                </div>
                <div className="text-slate-400">
                  Dot Product: <span className="text-slate-200">{metrics.dotProduct}</span>
                </div>
                <div className="text-slate-400">
                  ||A||: <span className="text-slate-200">{metrics.normA}</span> | ||B||:{" "}
                  <span className="text-slate-200">{metrics.normB}</span>
                </div>
                <div className="text-emerald-400 text-[10px] pt-1 border-t border-slate-800/80">
                  Rust crate: `stylus_nexus::verifier::compute_cosine_similarity_bps()`
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
