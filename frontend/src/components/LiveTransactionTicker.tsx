import { useState, useEffect } from "react";
import {
  ExternalLink,
  Activity,
  Pause,
  Play,
  RefreshCw,
  Box,
  Flame,
} from "lucide-react";
import type { LiveTransaction } from "../types";
import { fetchRecentTransactions } from "../web3";
import { ARBISCAN_EXPLORER_URL } from "../abi";

interface LiveTransactionTickerProps {
  currentBlockNumber: bigint | null;
  gasPriceGwei: string;
}

export function LiveTransactionTicker({
  currentBlockNumber,
  gasPriceGwei,
}: LiveTransactionTickerProps) {
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");

  const loadTxs = async () => {
    try {
      setIsRefreshing(true);
      const txs = await fetchRecentTransactions();
      if (txs.length > 0) {
        setTransactions(txs);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Failed to load recent txs:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTxs();
    if (!isStreaming) return;
    const interval = setInterval(loadTxs, 8000);
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="relative border-b border-cyan-500/20 bg-arbitrum-navy/50 backdrop-blur-md overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          {/* Header & Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75 ${
                    isStreaming ? "animate-ping" : ""
                  }`}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              <span className="font-bold uppercase tracking-wider text-cyan-300">
                Arbitrum Sepolia Live Feed
              </span>
            </div>

            {currentBlockNumber !== null && (
              <a
                href={`${ARBISCAN_EXPLORER_URL}/block/${currentBlockNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 rounded-md border border-cyan-500/30 bg-cyan-950/40 px-2 py-0.5 font-mono text-[11px] text-cyan-200 hover:border-cyan-400 transition-colors"
                title="View latest block on Arbiscan"
              >
                <Box className="h-3 w-3 text-cyan-400" />
                <span>#{currentBlockNumber.toLocaleString()}</span>
                <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
              </a>
            )}

            <div className="hidden lg:flex items-center space-x-1 font-mono text-[11px] text-slate-400">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>{gasPriceGwei} Gwei</span>
            </div>

            <span className="hidden xl:inline text-[10px] text-slate-500 font-mono">
              Synced {lastUpdated}
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsStreaming(!isStreaming)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title={isStreaming ? "Pause real-time stream" : "Resume real-time stream"}
              >
                {isStreaming ? (
                  <Pause className="h-3 w-3 text-amber-400" />
                ) : (
                  <Play className="h-3 w-3 text-emerald-400" />
                )}
              </button>

              <button
                onClick={loadTxs}
                disabled={isRefreshing}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Refresh latest transactions"
              >
                <RefreshCw
                  className={`h-3 w-3 text-cyan-400 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Real Transactions Stream */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 scrollbar-none font-mono text-[11px]">
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <a
                  key={`${tx.hash}-${idx}`}
                  href={`${ARBISCAN_EXPLORER_URL}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1 text-slate-300 hover:border-sky-500/50 hover:bg-sky-950/40 hover:text-cyan-200 transition-all shrink-0"
                >
                  <Activity className="h-3 w-3 text-arbitrum-blue shrink-0" />
                  <span className="font-semibold text-slate-200">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </span>
                  <span className="text-[10px] text-slate-500">{tx.timestamp}</span>
                  <ExternalLink className="h-2.5 w-2.5 text-slate-500" />
                </a>
              ))
            ) : (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-0.5">
                <RefreshCw className="h-3 w-3 animate-spin text-cyan-400" />
                <span>Polling recent Arbitrum Sepolia transaction receipts...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
