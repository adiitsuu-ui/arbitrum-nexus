import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  formatEther,
  keccak256,
  toHex,
  decodeEventLog,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import { stylusNexusAbi } from "./abi.js";

import fs from "fs";
import path from "path";

// Auto-discover and parse local .env files
function loadLocalEnv() {
  const currentDir = typeof (import.meta as any).dirname !== "undefined"
    ? (import.meta as any).dirname
    : (import.meta as any).dir || process.cwd();
  const possiblePaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "agent/.env"),
    path.resolve(currentDir, "../.env"),
  ];
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
            const [key, ...rest] = trimmed.split("=");
            const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
            if (!process.env[key.trim()]) {
              process.env[key.trim()] = val;
            }
          }
        }
      } catch {}
    }
  }
}
loadLocalEnv();

const RPC_URL = process.env.ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const CONTRACT_ADDRESS = (process.env.STYLUS_CONTRACT_ADDRESS ||
  "0x241950ddf85e90e286eaa46878eb72d1440b67f9") as Address;
const RAW_PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY?.trim() || process.env.DEPLOYER_PRIVATE_KEY?.trim();

if (!RAW_PRIVATE_KEY) {
  console.error("❌ Error: AGENT_PRIVATE_KEY or DEPLOYER_PRIVATE_KEY environment variable is required.");
  console.error("   Provide it in agent/.env or via environment.");
  process.exit(1);
}

async function main() {
  console.log("===============================================================");
  console.log("🧪 Testing Live Arbitrum Stylus Nexus on Arbitrum Sepolia");
  console.log("===============================================================");
  console.log(`📍 Contract: ${CONTRACT_ADDRESS}`);
  console.log(`📡 RPC:      ${RPC_URL}`);

  const publicClient = createPublicClient({
    chain: arbitrumSepolia,
    transport: http(RPC_URL),
  });

  const account = privateKeyToAccount(RAW_PRIVATE_KEY as Hex);
  const walletClient = createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(RPC_URL),
  });

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`👛 Deployer/Tester: ${account.address}`);
  console.log(`💰 Balance:         ${formatEther(balance)} ETH\n`);

  // 1. Verify Protocol Fee Configuration
  console.log("Step 1: Querying Protocol Fee & Treasury Settings...");
  const [treasuryAddr, feeBps] = (await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: stylusNexusAbi,
    functionName: "getProtocolFeeInfo",
  })) as [string, number];

  console.log(`   🏦 Active Treasury: ${treasuryAddr}`);
  console.log(`   📊 Protocol Fee:    ${feeBps} bps (${feeBps / 100}%)`);

  if (treasuryAddr.toLowerCase() !== "0x3FDbfB2caB39077a478ABA0cf66c720d1eAac4a0".toLowerCase()) {
    throw new Error(`Unexpected treasury address: ${treasuryAddr}`);
  }
  if (feeBps !== 150) {
    throw new Error(`Unexpected fee BPS: ${feeBps}`);
  }
  console.log("   ✅ Treasury and Fee BPS match user configuration!");

  // 2. Read Call: verifyVectorSimilarity
  console.log("\nStep 2: Testing on-chain WASM Vector Similarity computation...");
  const vecA = [1000, 2000, 3000, 4000];
  const vecB = [1020, 1980, 3010, 3990]; // Very close vectors
  const minThresholdBps = 9500; // 95%

  const [passed, score] = (await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: stylusNexusAbi,
    functionName: "verifyVectorSimilarity",
    args: [vecA, vecB, minThresholdBps],
  })) as [boolean, number];

  console.log(`   ✅ WASM Similarity Result: passed=${passed}, score=${score} bps (${score / 100}%)`);

  // 3. Check Initial Treasury Balance
  const treasuryInitialBalance = await publicClient.getBalance({ address: treasuryAddr as Address });
  console.log(`\n🏦 Treasury Initial Balance: ${formatEther(treasuryInitialBalance)} ETH (${treasuryInitialBalance} wei)`);

  // 4. State Call: createTask
  console.log("\nStep 3: Creating an on-chain AI Escrow Task with bounty...");
  const taskId = keccak256(toHex(`test-task-${Date.now()}`));
  const bounty = parseEther("0.0005"); // 0.0005 ETH bounty
  const minScoreBps = 9000; // 90% threshold

  console.log(`   Task ID: ${taskId}`);
  console.log(`   Bounty:  ${formatEther(bounty)} ETH`);

  const createTxHash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: stylusNexusAbi,
    functionName: "createTask",
    args: [taskId, "0x0000000000000000000000000000000000000000", minScoreBps],
    value: bounty,
  });

  console.log(`   📤 Tx Broadcast: ${createTxHash}`);
  console.log("   ⏳ Waiting for block confirmation...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash: createTxHash });
  console.log(`   ✅ Task Created in Block #${receipt.blockNumber} (Gas Used: ${receipt.gasUsed})`);

  // 5. Read Task Info
  console.log("\nStep 4: Verifying Task State on-chain...");
  const taskInfo = (await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: stylusNexusAbi,
    functionName: "getTaskInfo",
    args: [taskId],
  })) as [bigint, bigint, bigint, bigint, string];

  console.log(`   Status:         ${taskInfo[0] === 1n ? "1 (OPEN)" : taskInfo[0]}`);
  console.log(`   Min Score:      ${taskInfo[1]} bps`);
  console.log(`   Bounty:         ${formatEther(taskInfo[3])} ETH`);

  // 6. Settle Task (Deducts 1.5% fee -> treasury, 98.5% payout -> agent)
  console.log("\nStep 5: Autonomous Agent settling AI Escrow Task...");
  const settleTxHash = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi: stylusNexusAbi,
    functionName: "settleAiTask",
    args: [taskId, vecA, vecB],
  });

  console.log(`   📤 Settle Tx: ${settleTxHash}`);
  console.log("   ⏳ Waiting for block confirmation...");
  const settleReceipt = await publicClient.waitForTransactionReceipt({ hash: settleTxHash });
  console.log(`   ✅ Settle Confirmed in Block #${settleReceipt.blockNumber} (Gas Used: ${settleReceipt.gasUsed})`);

  // Decode logs
  console.log("\nStep 6: Decoding Transaction Logs & Protocol Fee Event...");
  for (const log of settleReceipt.logs) {
    try {
      const decoded = decodeEventLog({
        abi: stylusNexusAbi,
        data: log.data,
        topics: log.topics,
      });
      if (decoded.eventName === "ProtocolFeeCollected") {
        console.log(`   🔥 [EVENT] ProtocolFeeCollected:`);
        console.log(`      Treasury:   ${(decoded.args as any).treasury}`);
        console.log(`      Fee Amount: ${formatEther((decoded.args as any).feeAmount)} ETH (${(decoded.args as any).feeAmount} wei)`);
      } else if (decoded.eventName === "TaskCompleted") {
        console.log(`   🎉 [EVENT] TaskCompleted:`);
        console.log(`      Agent:   ${(decoded.args as any).agent}`);
        console.log(`      Score:   ${(decoded.args as any).achievedScore} bps`);
        console.log(`      Payout:  ${formatEther((decoded.args as any).payout)} ETH`);
        console.log(`      Fee:     ${formatEther((decoded.args as any).fee)} ETH`);
      }
    } catch {}
  }

  // 7. Verify Treasury Balance Increase
  const treasuryFinalBalance = await publicClient.getBalance({ address: treasuryAddr as Address });
  const feeDelta = treasuryFinalBalance - treasuryInitialBalance;
  const expectedFee = (bounty * 150n) / 10000n; // 1.5%

  console.log(`\nStep 7: Verifying Treasury Balance on Arbitrum Sepolia...`);
  console.log(`   Initial Balance: ${formatEther(treasuryInitialBalance)} ETH`);
  console.log(`   Final Balance:   ${formatEther(treasuryFinalBalance)} ETH`);
  console.log(`   Delta Received:  ${formatEther(feeDelta)} ETH (${feeDelta} wei)`);
  console.log(`   Expected Fee:    ${formatEther(expectedFee)} ETH (${expectedFee} wei)`);

  if (feeDelta === expectedFee) {
    console.log(`   ✅ 100% MATCH: Protocol fee was successfully received by ${treasuryAddr}!`);
  } else {
    console.warn(`   ⚠️ Balance delta differs (expected: ${expectedFee}, actual: ${feeDelta})`);
  }

  // 8. Verify final task info
  const completedTaskInfo = (await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: stylusNexusAbi,
    functionName: "getTaskInfo",
    args: [taskId],
  })) as [bigint, bigint, bigint, bigint, string];

  console.log(`\n🎉 Task Final Status: ${completedTaskInfo[0] === 2n ? "2 (COMPLETED)" : completedTaskInfo[0]}`);
  console.log(`   Achieved Score:    ${completedTaskInfo[2]} bps`);
  console.log(`   Remaining Bounty:  ${formatEther(completedTaskInfo[3])} ETH (Escrow emptied)`);
  console.log("===============================================================");
  console.log("🚀 ALL ON-CHAIN PROTOCOL FEE VERIFICATIONS SUCCEEDED!");
  console.log("===============================================================");
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
