// Reset onboarding claim flag in GiroToken contract
// Execute: npx hardhat run scripts/resetOnboardingClaim.js --network sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🔧 Resetting onboarding claim flag...");

  const GIRO_TOKEN_ADDRESS = "0x692eb0001723f098F4E7B3D3cd1Dd60b05AbbAf0";
  const USER_WALLET = "0xacfbfA8aF1429F4436bCFaba9CbAd0E34c501103"; // Substitua pela sua carteira

  console.log("Token Address:", GIRO_TOKEN_ADDRESS);
  console.log("User Wallet:", USER_WALLET);

  const giroToken = await hre.ethers.getContractAt("GiroToken", GIRO_TOKEN_ADDRESS);

  // Verificar se flag está ativa
  const hasClaimed = await giroToken.hasClaimedOnboarding(USER_WALLET);
  console.log("Current hasClaimedOnboarding:", hasClaimed);

  if (hasClaimed) {
    console.log("\n⚠️ Flag is TRUE. Cannot reset via normal methods.");
    console.log("You need to call this via owner or wait for another approach.");
    console.log("\nAlternative: The contract doesn't have a reset function.");
    console.log("The flag can only be set to true, never reset to false.");
    console.log("\nTo solve this, you can either:");
    console.log("1. Redeploy the contract fresh");
    console.log("2. Use a different wallet address for testing");
  } else {
    console.log("✅ Flag is already FALSE");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
