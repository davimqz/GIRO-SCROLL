// Script para fazer deploy dos contratos corretamente
// Execute: npx hardhat run scripts/deployNew.js --network sepolia

const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("🚀 Deploying Giro Smart Contracts on Ethereum Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);

  // ============================================
  // 1. Deploy GiroToken (com um endereço temporário para o marketplace)
  // ============================================
  console.log("\n1️⃣ Deploying GiroToken...");
  const GiroToken = await hre.ethers.getContractFactory("GiroToken");
  
  // Deployment com endereço temporário do deployer (será substituído depois)
  const initialSupply = 1000000; // 1 milhão GIRO para o pool de rewards
  const giroToken = await GiroToken.deploy(initialSupply, deployer.address);
  await giroToken.waitForDeployment();
  
  const tokenAddress = await giroToken.getAddress();
  console.log("✅ GiroToken deployed at:", tokenAddress);

  // ============================================
  // 2. Deploy GiroMarketplace
  // ============================================
  console.log("\n2️⃣ Deploying GiroMarketplace...");
  const GiroMarketplace = await hre.ethers.getContractFactory("GiroMarketplace");
  const giroMarketplace = await GiroMarketplace.deploy(tokenAddress);
  await giroMarketplace.waitForDeployment();
  
  const marketplaceAddress = await giroMarketplace.getAddress();
  console.log("✅ GiroMarketplace deployed at:", marketplaceAddress);

  // ============================================
  // 3. Configure Marketplace Address em GiroToken
  // ============================================
  console.log("\n3️⃣ Configuring marketplace in GiroToken...");
  const tx = await giroToken.setMarketplaceAddress(marketplaceAddress);
  await tx.wait();
  console.log("✅ Marketplace address configured!");

  // ============================================
  // 4. Verificações
  // ============================================
  console.log("\n✓ Verification:");
  const marketplaceAddrFromToken = await giroToken.marketplaceAddress();
  console.log("  - Token marketplace address:", marketplaceAddrFromToken);
  console.log("  - Expected marketplace address:", marketplaceAddress);
  
  if (marketplaceAddrFromToken.toLowerCase() === marketplaceAddress.toLowerCase()) {
    console.log("  ✅ Marketplace address correctly configured!");
  } else {
    console.error("  ❌ Marketplace address configuration failed!");
  }

  // ============================================
  // 5. Salvar endereços
  // ============================================
  console.log("\n📋 Contract Addresses:");
  console.log("========================================");
  console.log(`VITE_GIRO_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`VITE_GIRO_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("========================================");
  console.log("\n💡 Update your .env file with these addresses!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
