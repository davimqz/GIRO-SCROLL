// Check onboarding status for specific wallet address
// Execute: npx hardhat run scripts/checkWalletOnboarding.js --network sepolia

const hre = require("hardhat");

async function main() {
  const GIRO_TOKEN_ADDRESS = "0x692eb0001723f098F4E7B3D3cd1Dd60b05AbbAf0";
  const WALLET_TO_CHECK = "0x13e01ad064df6358da8cc7bcf098208b2854ec4e";

  console.log("🔍 Checking wallet onboarding status...\n");
  console.log("Token Address:  ", GIRO_TOKEN_ADDRESS);
  console.log("Wallet Address: ", WALLET_TO_CHECK);
  console.log("---\n");

  const giroToken = await hre.ethers.getContractAt("GiroToken", GIRO_TOKEN_ADDRESS);

  try {
    // Check contract state
    const hasClaimed = await giroToken.hasClaimedOnboarding(WALLET_TO_CHECK);
    const balanceRaw = await giroToken.balanceOf(WALLET_TO_CHECK);
    const balance = hre.ethers.formatEther(balanceRaw);

    console.log("📋 SMART CONTRACT STATE:");
    console.log("  hasClaimedOnboarding:  ", hasClaimed);
    console.log("  Token Balance:         ", balance, "GIRO");
    console.log("\n");

    if (hasClaimed) {
      console.log("✅ This wallet HAS claimed the onboarding reward");
    } else {
      console.log("❌ This wallet has NOT claimed the onboarding reward");
    }

  } catch (error) {
    console.error("❌ Error checking status:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
