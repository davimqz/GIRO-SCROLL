// Verify onboarding claim status
// Execute: npx hardhat run scripts/checkOnboardingStatus.js --network sepolia

const hre = require("hardhat");

async function main() {
  const GIRO_TOKEN_ADDRESS = "0x692eb0001723f098F4E7B3D3cd1Dd60b05AbbAf0";
  const USER_WALLET = "0xacfbfA8aF1429F4436bCFaba9CbAd0E34c501103";

  console.log("🔍 Checking onboarding claim status...\n");
  console.log("Token Address:", GIRO_TOKEN_ADDRESS);
  console.log("User Wallet:", USER_WALLET);
  console.log("---");

  const giroToken = await hre.ethers.getContractAt("GiroToken", GIRO_TOKEN_ADDRESS);

  try {
    const hasClaimed = await giroToken.hasClaimedOnboarding(USER_WALLET);
    console.log("\n✅ hasClaimedOnboarding:", hasClaimed);
    
    if (hasClaimed) {
      console.log("   → This wallet HAS claimed the onboarding reward");
    } else {
      console.log("   → This wallet has NOT claimed the onboarding reward");
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
