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

