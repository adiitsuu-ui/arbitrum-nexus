import { ExternalLink, ShieldCheck, Github, FileText, Globe } from "lucide-react";
import { ArbitrumLogo } from "./ArbitrumLogo";
import { ARBISCAN_EXPLORER_URL, DEFAULT_CONTRACT_ADDRESS } from "../abi";

export function Footer() {
  return (
    <footer className="border-t border-sky-500/15 bg-slate-950 py-10 px-4 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          <div className="flex items-center space-x-3">
            <ArbitrumLogo className="h-7 w-7" />
            <div>
              <div className="font-bold text-slate-200">Arbitrum Stylus Agent Nexus</div>
              <div className="text-[11px] text-slate-500">Autonomous AI Agent & MultiVM Compute Protocol</div>
            </div>
          </div>

          {/* Ecosystem Navigation Links */}
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <a
              href="https://github.com/adiitsuu-ui/arbitrum-nexus"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-slate-400 transition-colors hover:text-cyan-300"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
              <ExternalLink className="h-2.5 w-2.5 text-slate-600" />
            </a>

            <a
              href="https://github.com/adiitsuu-ui/arbitrum-nexus/blob/main/docs/GRANT_PROPOSAL.md"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-slate-400 transition-colors hover:text-cyan-300"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Grant Proposal</span>
              <ExternalLink className="h-2.5 w-2.5 text-slate-600" />
            </a>

            <a
              href="https://github.com/adiitsuu-ui/arbitrum-nexus/blob/main/docs/LAUNCH_THREAD.md"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-slate-400 transition-colors hover:text-cyan-300"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Launch Kit</span>
              <ExternalLink className="h-2.5 w-2.5 text-slate-600" />
            </a>

            <a
              href={`${ARBISCAN_EXPLORER_URL}/address/${DEFAULT_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-slate-400 transition-colors hover:text-cyan-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Arbiscan Contract</span>
              <ExternalLink className="h-2.5 w-2.5 text-slate-600" />
            </a>

            <a
              href="https://docs.arbitrum.io/stylus/stylus-overview"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 text-slate-400 transition-colors hover:text-cyan-300"
            >
              <span>Stylus Docs</span>
              <ExternalLink className="h-2.5 w-2.5 text-slate-600" />
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 Arbitrum Stylus Agent Nexus • MultiVM Co-equal Execution Engine</p>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>Contract verified on Arbitrum Sepolia Rollup</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
