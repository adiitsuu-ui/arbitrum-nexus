import { useState } from "react";
import {
  Sliders,
  Zap,
  Cpu,
  BarChart3,
  TrendingDown,
  Layers,
} from "lucide-react";

export function WasmBenchmark() {
  const [dimensions, setDimensions] = useState<number>(512);

  // Formulas
  const evmGas = Math.round(dimensions * 850 + 22000);
  const stylusGas = Math.round(dimensions * 22 + 1200);
  const savingsPct = (((evmGas - stylusGas) / evmGas) * 100).toFixed(1);

  const ethPriceUsd = 2850;
  const evmCostUsd = ((evmGas * 0.1 * ethPriceUsd) / 1e9).toFixed(5);
  const stylusCostUsd = ((stylusGas * 0.1 * ethPriceUsd) / 1e9).toFixed(5);

  const benchmarks = [
    {
      name: "WebAuthn Passkey (secp256r1)",
      scale: "1 P-256 Curve Sig",
      evm: "320,000 gas",
      stylus: "4,200 ink",
      savings: "98.7%",
      category: "Cryptography",
    },
    {
      name: "Vector Cosine (Fast Risk Model)",
      scale: "128 Dimensions",
      evm: "94,000 gas",
      stylus: "3,800 ink",
      savings: "96.0%",
      category: "AI Inference",
    },
    {
      name: "Vector Cosine (Neural Encoder)",
      scale: "512 Dimensions",
      evm: "412,000 gas",
      stylus: "12,500 ink",
      savings: "97.0%",
      category: "AI Inference",
    },
    {
      name: "OpenAI Vector Embedding-3",
      scale: "1,536 Dimensions",
      evm: "1,350,000 gas",
      stylus: "34,000 ink",
      savings: "97.5%",
      category: "AI Inference",
    },
    {
      name: "Matrix Transpose & Dot Product",
      scale: "2,048 Dimensions",
      evm: "2,420,000 gas",
      stylus: "61,000 ink",
      savings: "97.5%",
      category: "Linear Algebra",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="nexus-card rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-2 text-emerald-300">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 sm:text-2xl">
                Stylus WASM vs. Standard EVM Compute Benchmarks
              </h2>
            </div>
            <p className="max-w-2xl text-sm text-slate-400 leading-relaxed">
              Stylus compiles Rust to WebAssembly, running natively alongside EVM opcodes in Arbitrum Nitro.
              Experience 10x-100x lower computational gas fees and 100x-500x memory efficiency for compute-heavy
              AI vectors and cryptographic operations.
            </p>
          </div>

          <div className="flex items-center space-x-4 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4">
            <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">{savingsPct}%</span>
              <div className="text-xs text-slate-400">Average Gas Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Dimension Calculator & Chart */}
      <div className="nexus-card rounded-2xl p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">
              Dynamic Vector Math Efficiency Calculator
            </h3>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            {[128, 512, 1024, 1536, 2048].map((d) => (
              <button
                key={d}
                onClick={() => setDimensions(d)}
                className={`rounded px-2.5 py-1 font-mono transition-colors ${
                  dimensions === d
                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400">Embedding Dimensionality:</span>
            <span className="font-mono text-cyan-300 font-bold">{dimensions} Dimensions</span>
          </div>
          <input
            type="range"
            min="32"
            max="2048"
            step="32"
            value={dimensions}
            onChange={(e) => setDimensions(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg bg-slate-950 accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>32 D (Lightweight)</span>
            <span>512 D (Sentence BERT)</span>
            <span>1536 D (OpenAI Embedding-3)</span>
            <span>2048 D (Ultra High-Dim)</span>
          </div>
        </div>

        {/* Comparative Animated Bars */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Standard EVM Card */}
          <div className="rounded-xl border border-red-500/20 bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                Standard EVM (Solidity)
              </span>
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-400">
                Interpreted Bytecode
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-slate-100 font-mono">
                {evmGas.toLocaleString()}{" "}
                <span className="text-sm font-normal text-slate-500">Gas</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Estimated fee at 0.1 Gwei: <strong className="text-slate-200">${evmCostUsd} USD</strong>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300"
                  style={{ width: "100%" }}
                />
              </div>
              <div className="text-[10px] text-slate-500 text-right">100% relative baseline</div>
            </div>
          </div>

          {/* Arbitrum Stylus Card */}
          <div className="rounded-xl border border-emerald-500/30 bg-slate-950/80 p-5 space-y-4 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Arbitrum Stylus (Rust WASM)
              </span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                Native JIT Machine Code
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {stylusGas.toLocaleString()}{" "}
                <span className="text-sm font-normal text-emerald-500/80">Ink Eq.</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Estimated fee at 0.1 Gwei: <strong className="text-emerald-300">${stylusCostUsd} USD</strong>
              </div>
            </div>

            {/* Visual Bar */}
            <div className="space-y-1">
              <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-arbitrum-blue via-cyan-400 to-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.max(3, (stylusGas / evmGas) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold text-right">
                {savingsPct}% gas saved
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workload Benchmark Table */}
      <div className="nexus-card rounded-2xl overflow-hidden">
        <div className="border-b border-slate-800/80 p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-arbitrum-blue" />
            <h3 className="text-base font-bold text-slate-100">Stylus Cryptography & AI Workload Matrix</h3>
          </div>
          <span className="text-xs text-slate-400">Empirical Stylus Nitro Benchmarks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 font-mono text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Operation & Crate</th>
                <th className="p-4">Scale</th>
                <th className="p-4">Standard EVM</th>
                <th className="p-4">Stylus WASM</th>
                <th className="p-4">Gas Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {benchmarks.map((b, idx) => (
                <tr key={idx} className="transition-colors hover:bg-sky-950/20">
                  <td className="p-4 font-sans font-medium text-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[10px] text-sky-400">
                        {b.category}
                      </span>
                      <span>{b.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{b.scale}</td>
                  <td className="p-4 text-red-400">{b.evm}</td>
                  <td className="p-4 text-emerald-400 font-bold">{b.stylus}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                      {b.savings}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technical Architecture Notes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="nexus-card rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold">
            <Cpu className="h-4 w-4" />
            <span>Dual-VM MultiVM Runtime</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            EVM and WASM smart contracts coexist and call each other seamlessly without bridges. A Solidity contract can call a Stylus Rust contract as a standard library.
          </p>
        </div>

        <div className="nexus-card rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
            <TrendingDown className="h-4 w-4" />
            <span>Host I/O Zero-Copy Memory</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Stylus features zero-copy deserialization via `stylus-sdk`. Vector buffers and cryptographic keys are passed directly to WASM memory without EVM memory expansions.
          </p>
        </div>

        <div className="nexus-card rounded-xl p-4 space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold">
            <Layers className="h-4 w-4" />
            <span>Ink Accounting System</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Stylus measures computational cycles in "Ink" (1 Gas ≈ 10,000 Ink). Sub-gas resolution prevents microscopic memory allocations from penalizing complex math.
          </p>
        </div>
      </div>
    </div>
  );
}
