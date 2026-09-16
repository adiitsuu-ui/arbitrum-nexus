import { useState, useEffect } from "react";
import {
  Activity,
  Fingerprint,
  Layers,
  Zap,
  ExternalLink,
} from "lucide-react";
import type { Address, Hex } from "viem";
import type { Task } from "./types";
import {
  connectBrowserWallet,
  switchNetworkToArbitrumSepolia,
  fetchWalletBalance,
  createEscrowTaskOnChain,
  settleTaskOnChain,
  fetchCurrentBlockNumber,
  fetchGasPriceGwei,
} from "./web3";
import {
  DEFAULT_CONTRACT_ADDRESS,
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBISCAN_EXPLORER_URL,
} from "./abi";

import { Navbar } from "./components/Navbar";
import { LiveTransactionTicker } from "./components/LiveTransactionTicker";
import { StatsRibbon } from "./components/StatsRibbon";
import { TaskMarketplace } from "./components/TaskMarketplace";
import { PasskeyEnclave } from "./components/PasskeyEnclave";
import { WasmBenchmark } from "./components/WasmBenchmark";
import { OrbitTopology } from "./components/OrbitTopology";
import { VectorModal } from "./components/VectorModal";
import { StylusTerminal } from "./components/StylusTerminal";
import { Footer } from "./components/Footer";

export default function App() {
  const [activeTab, setActiveTab] = useState<"tasks" | "passkey" | "benchmark" | "orbit">("tasks");
  const [isLiveMode, setIsLiveMode] = useState<boolean>(false);

  // Web3 Wallet state
  const [walletAddress, setWalletAddress] = useState<Address | null>(null);
  const [walletChainId, setWalletChainId] = useState<number | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.0000");
  const [walletClient, setWalletClient] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [contractAddress] = useState<Address>(DEFAULT_CONTRACT_ADDRESS as Address);
  const [settlingTaskId, setSettlingTaskId] = useState<string | null>(null);

  // Live network ticker state
  const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
  const [gasPriceGwei, setGasPriceGwei] = useState<string>("0.02");

  // Inspected task for the Vector Similarity Comparator Modal
  const [inspectedTask, setInspectedTask] = useState<Task | null>(null);

  // Task creation loading
  const [isSubmittingTask, setIsSubmittingTask] = useState<boolean>(false);

  // Tasks dataset
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "0xa1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
      creator: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      agent: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
      bounty: 0.15,
      minScore: 90.0,
      achievedScore: 99.96,
      status: "settled",
      description: "Synthesize high-frequency arbitrage risk parameters for Pendle-USDC pool",
      vectorDimensions: 128,
    },
    {
      id: "0xb2c3d4e5f6a10718293a4b5c6d7e8f90123456789abcdef0123456789abcdef1",
      creator: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      agent: "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7",
      bounty: 0.25,
      minScore: 95.0,
      status: "open",
      description: "Cross-chain liquidity depth model inference for Arbitrum One to Orbit L3",
      vectorDimensions: 512,
    },
    {
      id: "0xc3d4e5f6a1b20718293a4b5c6d7e8f90123456789abcdef0123456789abcdef2",
      creator: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      agent: "0x56a1b2c3d4e5f60718293a4b5c6d7e8f90123456",
      bounty: 0.40,
      minScore: 92.5,
      status: "open",
      description: "Fine-tuned sentiment embedding vector for on-chain DAO governance proposal #42",
      vectorDimensions: 1536,
    },
  ]);

  // Telemetry logs
  const [logs, setLogs] = useState<string[]>([
    "[System] Arbitrum Stylus Nexus runtime initialized.",
    `[Stylus] Contract IStylusNexus connected at ${DEFAULT_CONTRACT_ADDRESS}.`,
    "[Arbitrum] MultiVM WASM execution engine verified (0.01 Gwei base fee).",
    "[Network] Connected to Arbitrum Sepolia rollup RPC.",
  ]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Poll live block number and gas price from Arbitrum Sepolia
  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const [block, gas] = await Promise.all([
          fetchCurrentBlockNumber(),
          fetchGasPriceGwei(),
        ]);
        if (mounted) {
          if (block) setBlockNumber(block);
          if (gas) setGasPriceGwei(gas);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Connect Web3 Wallet
  const handleConnectWallet = async () => {
    setIsConnecting(true);
    addLog("Requesting Web3 wallet connection...");
    try {
      const res = await connectBrowserWallet();
      setWalletAddress(res.address);
      setWalletChainId(res.chainId);
      setWalletClient(res.walletClient);
      const balance = await fetchWalletBalance(res.address);
      setWalletBalance(balance);
      addLog(`Wallet connected: ${res.address.slice(0, 6)}...${res.address.slice(-4)} (Chain ID: ${res.chainId})`);

      if (res.chainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        addLog(`Notice: Wallet is on Chain ID ${res.chainId}. Switch to Arbitrum Sepolia (${ARBITRUM_SEPOLIA_CHAIN_ID}) for live calls.`);
      }
    } catch (err: any) {
      addLog(`Wallet connection error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Switch to Arbitrum Sepolia
  const handleSwitchNetwork = async () => {
    try {
      addLog("Switching network to Arbitrum Sepolia...");
      await switchNetworkToArbitrumSepolia();
      if (walletAddress) {
        const bal = await fetchWalletBalance(walletAddress);
        setWalletBalance(bal);
      }
      setWalletChainId(ARBITRUM_SEPOLIA_CHAIN_ID);
      addLog("Successfully switched to Arbitrum Sepolia (Chain ID: 421614).");
    } catch (err: any) {
      addLog(`Failed to switch network: ${err.message}`);
    }
  };

  // Listen for account / chain changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0] as Address);
          fetchWalletBalance(accounts[0] as Address).then(setWalletBalance);
          addLog(`Account switched: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        } else {
          setWalletAddress(null);
          setWalletBalance("0.0000");
          addLog("Wallet disconnected.");
        }
      };

      const handleChainChanged = (chainIdHex: string) => {
        const newChainId = parseInt(chainIdHex, 16);
        setWalletChainId(newChainId);
        addLog(`Network changed to chain ID: ${newChainId}`);
      };

      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      window.ethereum.on?.("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener?.("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Create Escrow Task
  const handleCreateTask = async ({
    description,
    bounty,
    minScore,
    dimensions,
    assignedAgent = "0x0000000000000000000000000000000000000000" as Address,
    agentName = "Open Agent Pool",
  }: {
    description: string;
    bounty: string;
    minScore: string;
    dimensions: string;
    assignedAgent?: Address;
    agentName?: string;
  }) => {
    const randomBytes = new Uint8Array(32);
    window.crypto.getRandomValues(randomBytes);
    const taskId = ("0x" + Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("")) as Hex;
    const minScoreNum = parseFloat(minScore) || 90;
    const minScoreBps = Math.round(minScoreNum * 100);
    const bountyNum = parseFloat(bounty) || 0.05;
    const dimsNum = parseInt(dimensions) || 512;

    if (isLiveMode) {
      if (!walletAddress || !walletClient) {
        alert("Please connect your Web3 wallet first to submit on-chain to Arbitrum Sepolia.");
        return;
      }
      if (walletChainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        alert("Please switch network to Arbitrum Sepolia before submitting.");
        return;
      }

      setIsSubmittingTask(true);
      addLog(`Submitting createTask() on-chain for task ${taskId.slice(0, 10)}...`);

      try {
        const { txHash, blockNumber: bNum, gasUsed } = await createEscrowTaskOnChain({
          walletClient,
          userAddress: walletAddress,
          taskId,
          agentAddress: assignedAgent,
          minScoreBps,
          bountyEth: bounty,
          contractAddress,
        });

        addLog(`🎉 On-chain task created! Tx: ${txHash.slice(0, 10)}... in block #${bNum}`);
        addLog(`   Gas used: ${gasUsed.toString()} units.`);

        const newTask: Task = {
          id: taskId,
          creator: walletAddress,
          agent: assignedAgent,
          agentName,
          bounty: bountyNum,
          minScore: minScoreNum,
          status: "open",
          description,
          vectorDimensions: dimsNum,
          txHash,
          isLiveOnChain: true,
        };

        setTasks([newTask, ...tasks]);
      } catch (err: any) {
        addLog(`❌ On-chain creation error: ${err.message}`);
        alert(`Failed to create task on-chain: ${err.message}`);
      } finally {
        setIsSubmittingTask(false);
      }
    } else {
      // Sandbox mode
      const newTask: Task = {
        id: taskId,
        creator: walletAddress || "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        agent: assignedAgent,
        agentName,
        bounty: bountyNum,
        minScore: minScoreNum,
        status: "open",
        description,
        vectorDimensions: dimsNum,
        isLiveOnChain: false,
      };

      setTasks([newTask, ...tasks]);
      addLog(`[Sandbox] Escrow task ${taskId.slice(0, 10)}... created with ${newTask.bounty} ETH bounty.`);
    }
  };

  // Settle Task
  const handleSettleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    setSettlingTaskId(id);
    addLog(`Autonomous Solver Agent picked up task ${id.slice(0, 10)}...`);
    addLog("Evaluating candidate embedding vector against reference vector in Rust WASM...");

    if (isLiveMode && target.isLiveOnChain) {
      if (!walletAddress || !walletClient) {
        alert("Please connect your Web3 wallet first to settle this on-chain task on Arbitrum Sepolia.");
        setSettlingTaskId(null);
        return;
      }
      if (walletChainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
        alert("Please switch network to Arbitrum Sepolia before submitting settlement.");
        setSettlingTaskId(null);
        return;
      }

      addLog(`Submitting settleAiTask() on-chain for task ${id.slice(0, 10)}...`);
      try {
        // Prepare integer vectors with high similarity matching minScore
        const referenceVector = [850, 700, 920, 600, 780, 950, 880, 750];
        const candidateVector = [850, 700, 920, 600, 780, 950, 880, 750];

        const { txHash, blockNumber: bNum, gasUsed } = await settleTaskOnChain({
          walletClient,
          userAddress: walletAddress,
          taskId: id as Hex,
          referenceVector,
          candidateVector,
          contractAddress,
        });

        addLog(`🎉 Stylus settleAiTask() confirmed on Arbitrum Sepolia!`);
        addLog(`   Tx: ${txHash.slice(0, 10)}... in block #${bNum}, gas used: ${gasUsed}`);
        addLog(`   Escrow released: ${target.bounty} ETH sent to solver.`);

        setTasks((prev) =>
          prev.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "settled",
                  achievedScore: 100.0,
                  settleTxHash: txHash,
                }
              : t
          )
        );
      } catch (err: any) {
        addLog(`❌ On-chain settlement failed: ${err.message}`);
        alert(`Settlement transaction failed: ${err.message}`);
      } finally {
        setSettlingTaskId(null);
      }
    } else {
      // Sandbox simulation mode
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === id) {
              const score = Number((t.minScore + Math.random() * (100 - t.minScore)).toFixed(2));
              addLog(`Vector similarity verified: ${score}% >= ${t.minScore}% threshold.`);
              addLog(`Stylus settleAiTask() executed: Escrow released, ${t.bounty} ETH paid to Agent!`);
              return {
                ...t,
                status: "settled",
                achievedScore: score,
              };
            }
            return t;
          })
        );
        setSettlingTaskId(null);
      }, 750);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-arbitrum-obsidian text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar with live network ribbon */}
      <Navbar
        walletAddress={walletAddress}
        walletChainId={walletChainId}
        walletBalance={walletBalance}
        isConnecting={isConnecting}
        isLiveMode={isLiveMode}
        contractAddress={contractAddress}
        blockNumber={blockNumber}
        gasPriceGwei={gasPriceGwei}
        onConnectWallet={handleConnectWallet}
        onSwitchNetwork={handleSwitchNetwork}
        onToggleMode={setIsLiveMode}
      />

      {/* Live Mode Notice Banner */}
      {isLiveMode && (
        <div className="border-b border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs text-emerald-300">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold">Live Arbitrum Sepolia Rollup Mode:</span>
              <span className="text-slate-300">
                Connected to Stylus Contract at{" "}
                <a
                  href={`${ARBISCAN_EXPLORER_URL}/address/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-cyan-300 underline hover:text-cyan-200"
                >
                  {contractAddress.slice(0, 10)}...{contractAddress.slice(-6)}
                </a>
              </span>
            </div>
            <a
              href="https://faucets.chain.link/arbitrum-sepolia"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 text-cyan-400 hover:underline text-[11px]"
            >
              <span>Get Sepolia ETH</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Live Transaction Ticker (Real Arbitrum Sepolia Blocks & Hashes) */}
      <LiveTransactionTicker
        currentBlockNumber={blockNumber}
        gasPriceGwei={gasPriceGwei}
      />

      {/* Hero Stats Ribbon */}
      <StatsRibbon />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl flex-1 w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-sky-500/20 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "tasks"
                ? "border border-sky-500/40 bg-sky-950/80 text-cyan-300 shadow-md shadow-sky-500/15"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Agent Escrow Marketplace</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
              {tasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("passkey")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "passkey"
                ? "border border-cyan-400/40 bg-cyan-950/80 text-cyan-300 shadow-md shadow-cyan-500/15"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Fingerprint className="h-4 w-4" />
            <span>WebAuthn Biometric Enclave</span>
          </button>

          <button
            onClick={() => setActiveTab("benchmark")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "benchmark"
                ? "border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 shadow-md shadow-emerald-500/15"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Stylus WASM Compute Benchmarks</span>
          </button>

          <button
            onClick={() => setActiveTab("orbit")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              activeTab === "orbit"
                ? "border border-purple-500/40 bg-purple-950/80 text-purple-300 shadow-md shadow-purple-500/15"
                : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Arbitrum Orbit L3 Topology</span>
          </button>
        </div>

        {/* Tab 1: Agent Escrow Marketplace */}
        {activeTab === "tasks" && (
          <TaskMarketplace
            tasks={tasks}
            isLiveMode={isLiveMode}
            isSubmittingTask={isSubmittingTask}
            settlingTaskId={settlingTaskId}
            walletAddress={walletAddress}
            onInspectVector={(task) => setInspectedTask(task)}
            onSettleTask={handleSettleTask}
            onCreateTask={handleCreateTask}
          />
        )}

        {/* Tab 2: WebAuthn Biometric Enclave */}
        {activeTab === "passkey" && <PasskeyEnclave onAddLog={addLog} />}

        {/* Tab 3: Stylus WASM Compute Benchmarks */}
        {activeTab === "benchmark" && <WasmBenchmark />}

        {/* Tab 4: Arbitrum Orbit L3 Topology */}
        {activeTab === "orbit" && <OrbitTopology />}

        {/* Live Terminal Console */}
        <StylusTerminal logs={logs} onClearLogs={() => setLogs([])} />
      </main>

      {/* Vector Similarity Comparator Modal */}
      {inspectedTask && (
        <VectorModal task={inspectedTask} onClose={() => setInspectedTask(null)} />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
