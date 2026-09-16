import {
  Cpu,
  Fingerprint,
  Layers,
  Zap,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Gauge,
} from "lucide-react";

export function StatsRibbon() {
  return (
    <div className="border-b border-sky-500/10 bg-gradient-to-b from-arbitrum-card/40 via-arbitrum-obsidian/60 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {/* Card 1: MultiVM Execution Engine */}
          <div className="nexus-card nexus-card-interactive group relative overflow-hidden rounded-2xl p-4">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-arbitrum-blue/10 blur-xl transition-all group-hover:bg-arbitrum-blue/20" />
            <div className="mb-2 flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                Execution Engine
              </span>
              <div className="rounded-lg bg-sky-500/10 p-1.5 text-arbitrum-blue border border-sky-500/20">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-100">Stylus Rust</span>
              <span className="text-xs font-semibold text-cyan-300">WASM</span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              <span>MultiVM co-equal with EVM</span>
            </div>
          </div>

          {/* Card 2: Gas & Compute Savings */}
          <div className="nexus-card nexus-card-interactive group relative overflow-hidden rounded-2xl p-4">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl transition-all group-hover:bg-emerald-500/20" />
            <div className="mb-2 flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Compute Savings
              </span>
              <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-400 border border-emerald-500/20">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">97.8%</span>
              <span className="text-xs font-semibold text-emerald-500/90">Lower Gas</span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
              <TrendingDown className="h-3 w-3 text-emerald-400" />
              <span>100x-500x memory efficiency</span>
            </div>
          </div>

          {/* Card 3: Biometric WebAuthn Passkey */}
          <div className="nexus-card nexus-card-interactive group relative overflow-hidden rounded-2xl p-4">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-xl transition-all group-hover:bg-cyan-500/20" />
            <div className="mb-2 flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Passkey Enclave
              </span>
              <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400 border border-cyan-500/20">
                <Fingerprint className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-cyan-300">4,200</span>
              <span className="text-xs font-semibold text-slate-400">Ink Units</span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
              <CheckCircle2 className="h-3 w-3 text-cyan-400" />
              <span>&lt;$0.0001 per P-256 verification</span>
            </div>
          </div>

          {/* Card 4: Orbit L3 Architecture */}
          <div className="nexus-card nexus-card-interactive group relative overflow-hidden rounded-2xl p-4">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 blur-xl transition-all group-hover:bg-purple-500/20" />
            <div className="mb-2 flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                Orbit L3 Velocity
              </span>
              <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-400 border border-purple-500/20">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl sm:text-2xl font-black text-purple-300">250ms</span>
              <span className="text-xs font-semibold text-purple-400">Block Time</span>
            </div>
            <div className="mt-1 flex items-center space-x-1 text-[11px] text-slate-400">
              <Gauge className="h-3 w-3 text-purple-400" />
              <span>AnyTrust DAC + $NEXUS Gas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
