// Script para configurar os contratos após deploy
// Execute: npx hardhat run scripts/setupContracts.js --network scrollSepolia

const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting up contracts...");

  // Endereços dos contratos deploy​ados
  const GIRO_TOKEN_ADDRESS = process.env.VITE_GIRO_TOKEN_ADDRESS || "0xb13ba132b2364ABFf701b1A72fAF0747392CD6B3";
  const GIRO_MARKETPLACE_ADDRESS = process.env.VITE_GIRO_MARKETPLACE_ADDRESS || "0x3AcdF4d969Db431c47883a2F5B6350B5f4DE08ff";

  console.log("Token Address:", GIRO_TOKEN_ADDRESS);
  console.log("Marketplace Address:", GIRO_MARKETPLACE_ADDRESS);

  // Obtém instância do contrato GiroToken
  const giroToken = await hre.ethers.getContractAt("GiroToken", GIRO_TOKEN_ADDRESS);

  // Configura o endereço do Marketplace
  console.log("\n📝 Setting marketplace address in GiroToken...");
  const tx = await giroToken.setMarketplaceAddress(GIRO_MARKETPLACE_ADDRESS);
  await tx.wait();
  console.log("✅ Marketplace address set successfully!");

  // Verifica se foi configurado corretamente
  const marketplaceAddr = await giroToken.marketplaceAddress();
  console.log("\n✓ Current marketplace address:", marketplaceAddr);
  
  if (marketplaceAddr.toLowerCase() === GIRO_MARKETPLACE_ADDRESS.toLowerCase()) {
    console.log("✅ Configuration successful!");
  } else {
    console.error("❌ Configuration failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
