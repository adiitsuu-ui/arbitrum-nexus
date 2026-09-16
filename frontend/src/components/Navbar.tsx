import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  RefreshCw,
  Shield,
  Wallet,
} from "lucide-react";
import type { Address } from "viem";
import { ArbitrumLogo } from "./ArbitrumLogo";
import {
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBISCAN_EXPLORER_URL,
} from "../abi";

interface NavbarProps {
  walletAddress: Address | null;
  walletChainId: number | null;
  walletBalance: string;
  isConnecting: boolean;
  isLiveMode: boolean;
  contractAddress: Address;
  blockNumber: bigint | null;
  gasPriceGwei: string;
  onConnectWallet: () => void;
  onSwitchNetwork: () => void;
  onToggleMode: (isLive: boolean) => void;
}

export function Navbar({
  walletAddress,
  walletChainId,
  walletBalance,
  isConnecting,
  isLiveMode,
  contractAddress,
  blockNumber,
  gasPriceGwei,
  onConnectWallet,
  onSwitchNetwork,
  onToggleMode,
}: NavbarProps) {
  const [copiedContract, setCopiedContract] = useState(false);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const isWrongNetwork = walletAddress && walletChainId !== ARBITRUM_SEPOLIA_CHAIN_ID;

  return (
    <header className="sticky top-0 z-50 border-b border-sky-500/15 bg-arbitrum-obsidian/85 backdrop-blur-xl">
      {/* Top Live Network Ribbon */}
      <div className="border-b border-sky-500/10 bg-slate-950/60 px-4 py-1.5 text-[11px] text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          {/* Left: Chain Status & Block Height Ticker */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">Arbitrum Sepolia</span>
              <span className="font-mono text-[10px] text-slate-500">(421614)</span>
            </div>

            <div className="hidden items-center space-x-1 font-mono sm:flex">
              <span className="text-slate-500">Block:</span>
              <span className="font-semibold text-cyan-300">
                {blockNumber ? `#${blockNumber.toLocaleString()}` : "Syncing..."}
              </span>
              <span className="rounded bg-sky-500/15 px-1 py-0.2 text-[9px] text-sky-400">250ms</span>
            </div>

            <div className="hidden items-center space-x-1 font-mono md:flex">
              <Flame className="h-3 w-3 text-amber-400" />
              <span className="text-slate-500">Gas:</span>
              <span className="font-semibold text-amber-300">{gasPriceGwei} Gwei</span>
            </div>

            <div className="hidden items-center space-x-1.5 lg:flex">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                ArbOS 32 • Stylus WASM Active
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 font-mono">
                Protocol Fee: 1.5%
              </span>
            </div>
          </div>

          {/* Right: Contract Address quick-copy + Faucet link */}
          <div className="flex items-center space-x-3">
            <div
              onClick={handleCopyAddress}
              title="Click to copy Stylus Contract Address"
              className="flex cursor-pointer items-center space-x-1 rounded-md border border-sky-500/20 bg-sky-950/40 px-2 py-0.5 font-mono text-[11px] text-sky-300 transition-colors hover:border-sky-400/50 hover:bg-sky-900/40"
            >
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>Contract: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}</span>
              {copiedContract ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 text-slate-400" />
              )}
            </div>

            <a
              href={`${ARBISCAN_EXPLORER_URL}/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center space-x-1 text-slate-400 transition-colors hover:text-cyan-300 sm:flex"
            >
              <span>Arbiscan</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <a
              href="https://faucets.chain.link/arbitrum-sepolia"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>Faucet ETH</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <ArbitrumLogo className="h-9 w-9" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-gradient-to-r from-white via-sky-200 to-cyan-300 bg-clip-text text-lg font-black tracking-tight text-transparent">
                ARBITRUM NEXUS
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Stylus v1.0
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              MultiVM Autonomous Agent & Compute Protocol
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Mode Switcher Toggle */}
          <div className="flex items-center rounded-xl border border-sky-500/20 bg-slate-950/80 p-1">
            <button
              onClick={() => onToggleMode(false)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                !isLiveMode
                  ? "border border-sky-500/40 bg-sky-950/80 text-sky-200 shadow-sm shadow-sky-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sandbox
            </button>
            <button
              onClick={() => onToggleMode(true)}
              className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                isLiveMode
                  ? "border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 shadow-sm shadow-emerald-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              </span>
              <span>Live Rollup</span>
            </button>
          </div>

          {/* Web3 Wallet Controls */}
          {walletAddress ? (
            <div className="flex items-center space-x-2">
              {isWrongNetwork ? (
                <button
                  onClick={onSwitchNetwork}
                  className="flex items-center space-x-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/25"
                >
                  <AlertTriangle className="h-3.5 w-3.5 animate-bounce" />
                  <span>Switch to Arbitrum</span>
                </button>
              ) : (
                <div className="hidden items-center space-x-1.5 rounded-xl border border-slate-700/60 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 sm:flex">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{walletBalance} ETH</span>
                </div>
              )}

              <div className="flex items-center space-x-2 rounded-xl border border-sky-500/30 bg-arbitrum-card px-3 py-1.5 font-mono text-xs text-sky-200 shadow-md shadow-sky-950/50">
                <div className="h-2 w-2 rounded-full bg-cyan-400"></div>
                <span>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={isConnecting}
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-arbitrum-blue to-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-950" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-3.5 w-3.5 text-slate-950" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
