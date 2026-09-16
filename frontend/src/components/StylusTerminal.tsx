import { useState, useRef, useEffect } from "react";
import {
  Terminal,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface StylusTerminalProps {
  logs: string[];
  onClearLogs: () => void;
}

export function StylusTerminal({ logs, onClearLogs }: StylusTerminalProps) {
  const [filter, setFilter] = useState<"all" | "wasm" | "tx" | "passkey">("all");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isCollapsed]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "wasm") return log.includes("Stylus") || log.includes("WASM") || log.includes("ink");
    if (filter === "tx") return log.includes("Tx") || log.includes("task") || log.includes("Wallet") || log.includes("Block");
    if (filter === "passkey") return log.includes("Passkey") || log.includes("WebAuthn") || log.includes("P-256");
    return true;
  });

  return (
    <div className="nexus-card rounded-2xl overflow-hidden shadow-2xl border border-sky-500/20 font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-950 px-4 py-2.5">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex items-center space-x-2 text-slate-300">
            <Terminal className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-[12px]">Stylus Nitro Execution & Telemetry Log</span>
          </div>

          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[10px] font-semibold text-emerald-400 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
            <span>LIVE</span>
          </span>
        </div>

        {/* Filter and Control Buttons */}
        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <div className="hidden sm:flex items-center space-x-1 rounded-md border border-slate-800 bg-slate-900 p-0.5 text-[10px]">
            {(["all", "wasm", "tx", "passkey"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded px-2 py-0.5 uppercase tracking-wider transition-colors ${
                  filter === f
                    ? "bg-sky-500/20 text-cyan-300 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <button
            onClick={handleCopyLogs}
            title="Copy logs"
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={onClearLogs}
            title="Clear logs"
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand terminal" : "Collapse terminal"}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!isCollapsed && (
        <div className="h-44 overflow-y-auto bg-slate-950/90 p-4 space-y-1.5 text-[11px] leading-relaxed select-text">
          {filteredLogs.map((log, idx) => {
            const isHighlight =
              log.includes("verifyPasskey") ||
              log.includes("Settled") ||
              log.includes("On-chain") ||
              log.includes("🎉") ||
              log.includes("connected");
            const isError = log.includes("Error") || log.includes("error") || log.includes("❌");

            return (
              <div key={idx} className="flex space-x-2.5">
                <span className="text-slate-600 select-none">&gt;</span>
                <span
                  className={
                    isError
                      ? "text-red-400 font-semibold"
                      : isHighlight
                      ? "text-cyan-300 font-medium"
                      : "text-slate-300"
                  }
                >
                  {log}
                </span>
              </div>
            );
          })}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
}
