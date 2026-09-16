import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatEther,
  parseEther,
  type Address,
  type Hash,
  type Hex,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import {
  stylusNexusAbi,
  DEFAULT_CONTRACT_ADDRESS,
  ARBITRUM_SEPOLIA_CHAIN_ID,
  ARBITRUM_SEPOLIA_RPC,
  ARBISCAN_EXPLORER_URL,
} from "./abi";

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Public client for read calls and receipts
export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(ARBITRUM_SEPOLIA_RPC),
});

export async function connectBrowserWallet(): Promise<{
  address: Address;
  chainId: number;
  walletClient: any;
}> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No Web3 wallet detected. Please install MetaMask, Rabby, or Coinbase Wallet.");
  }

  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts authorized by user.");
  }

  const chainIdHex = (await window.ethereum.request({
    method: "eth_chainId",
  })) as string;
  const chainId = parseInt(chainIdHex, 16);

  const walletClient = createWalletClient({
    chain: arbitrumSepolia,
    transport: custom(window.ethereum),
  });

  return {
    address: accounts[0] as Address,
    chainId,
    walletClient,
  };
}

export async function switchNetworkToArbitrumSepolia(): Promise<void> {
  if (!window.ethereum) return;
  const hexChainId = `0x${ARBITRUM_SEPOLIA_CHAIN_ID.toString(16)}`;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    // Error code 4902 indicates chain has not been added to MetaMask
    if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexChainId,
            chainName: "Arbitrum Sepolia",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [ARBITRUM_SEPOLIA_RPC],
            blockExplorerUrls: [ARBISCAN_EXPLORER_URL],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

export async function fetchWalletBalance(address: Address): Promise<string> {
  try {
    const bal = await publicClient.getBalance({ address });
    return Number(formatEther(bal)).toFixed(4);
  } catch {
    return "0.0000";
  }
}

export async function createEscrowTaskOnChain({
  walletClient,
  userAddress,
  taskId,
  agentAddress,
  minScoreBps,
  bountyEth,
  contractAddress = DEFAULT_CONTRACT_ADDRESS,
}: {
  walletClient: any;
  userAddress: Address;
  taskId: Hex;
  agentAddress: Address;
  minScoreBps: number;
  bountyEth: string;
  contractAddress?: Address;
}): Promise<{ txHash: Hash; blockNumber: bigint; gasUsed: bigint }> {
  const value = parseEther(bountyEth);

  const txHash = (await walletClient.writeContract({
    account: userAddress,
    address: contractAddress,
    abi: stylusNexusAbi,
    functionName: "createTask",
    args: [taskId, agentAddress, minScoreBps],
    value,
  })) as Hash;

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  return {
    txHash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
  };
}

export async function getTaskInfoFromChain(
  taskId: Hex,
  contractAddress: Address = DEFAULT_CONTRACT_ADDRESS as Address
) {
  return await publicClient.readContract({
    address: contractAddress,
    abi: stylusNexusAbi,
    functionName: "getTaskInfo",
    args: [taskId],
  });
}

export async function fetchCurrentBlockNumber(): Promise<bigint | null> {
  try {
    return await publicClient.getBlockNumber();
  } catch (err) {
    console.error("Failed to fetch block number:", err);
    return null;
  }
}

export async function fetchGasPriceGwei(): Promise<string> {
  try {
    const price = await publicClient.getGasPrice();
    // 1 Gwei = 10^9 wei
    const gwei = Number(price) / 1e9;
    return gwei < 0.001 ? "<0.01" : gwei.toFixed(2);
  } catch (err) {
    return "0.02";
  }
}

import type { LiveTransaction } from "./types";

export async function fetchRecentTransactions(): Promise<LiveTransaction[]> {
  try {
    const block = await publicClient.getBlock({ includeTransactions: true });
    if (!block || !block.transactions) return [];

    const txs: LiveTransaction[] = [];
    for (const tx of block.transactions.slice(0, 8)) {
      if (typeof tx === "string") {
        txs.push({
          hash: tx,
          blockNumber: block.number,
          timestamp: new Date(Number(block.timestamp) * 1000).toLocaleTimeString(),
        });
      } else {
        txs.push({
          hash: tx.hash,
          blockNumber: block.number,
          timestamp: new Date(Number(block.timestamp) * 1000).toLocaleTimeString(),
          gasLimit: tx.gas?.toString(),
        });
      }
    }
    return txs;
  } catch (err) {
    console.error("Failed to fetch recent transactions:", err);
    return [];
  }
}

export async function verifyVectorSimilarityOnChain(
  vecA: number[],
  vecB: number[],
  minThresholdBps: number = 9000,
  contractAddress: Address = DEFAULT_CONTRACT_ADDRESS
): Promise<{ isPassing: boolean; scoreBps: number; blockNumber: bigint | null; latencyMs: number }> {
  const start = performance.now();
  const [res, blockNumber] = await Promise.all([
    publicClient.readContract({
      address: contractAddress,
      abi: stylusNexusAbi,
      functionName: "verifyVectorSimilarity",
      args: [vecA, vecB, minThresholdBps],
    }),
    publicClient.getBlockNumber().catch(() => null),
  ]);
  const latencyMs = Math.round(performance.now() - start);
  const [isPassing, scoreBps] = res as [boolean, number];
  return { isPassing, scoreBps, blockNumber, latencyMs };
}

export async function verifyPasskeyOnChain(
  pubkeyBytes: number[],
  msgHash: Hex,
  sigBytes: number[],
  contractAddress: Address = DEFAULT_CONTRACT_ADDRESS
): Promise<{ isValid: boolean; blockNumber: bigint | null; latencyMs: number }> {
  const start = performance.now();
  const [res, blockNumber] = await Promise.all([
    publicClient.readContract({
      address: contractAddress,
      abi: stylusNexusAbi,
      functionName: "verifyPasskey",
      args: [pubkeyBytes, msgHash, sigBytes],
    }),
    publicClient.getBlockNumber().catch(() => null),
  ]);
  const latencyMs = Math.round(performance.now() - start);
  return { isValid: Boolean(res), blockNumber, latencyMs };
}

export async function settleTaskOnChain({
  walletClient,
  userAddress,
  taskId,
  referenceVector,
  candidateVector,
  contractAddress = DEFAULT_CONTRACT_ADDRESS,
}: {
  walletClient: any;
  userAddress: Address;
  taskId: Hex;
  referenceVector: number[];
  candidateVector: number[];
  contractAddress?: Address;
}): Promise<{ txHash: Hash; blockNumber: bigint; gasUsed: bigint }> {
  const txHash = (await walletClient.writeContract({
    account: userAddress,
    address: contractAddress,
    abi: stylusNexusAbi,
    functionName: "settleAiTask",
    args: [taskId, referenceVector, candidateVector],
  })) as Hash;

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  return {
    txHash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
  };
}



