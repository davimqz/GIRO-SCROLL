const hre = require("hardhat");

async function main() {
  console.log("🚀 Iniciando deploy dos contratos...\n");

  // Deploy GiroToken
  console.log("📦 Fazendo deploy de GiroToken...");
  const GiroToken = await hre.ethers.getContractFactory("GiroToken");
  const giroToken = await GiroToken.deploy();
  await giroToken.waitForDeployment();
  const tokenAddress = await giroToken.getAddress();
  console.log(`✅ GiroToken deployed em: ${tokenAddress}\n`);

  // Deploy GiroMarketplace
  console.log("📦 Fazendo deploy de GiroMarketplace...");
  const GiroMarketplace = await hre.ethers.getContractFactory("GiroMarketplace");
  const marketplace = await GiroMarketplace.deploy(tokenAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log(`✅ GiroMarketplace deployed em: ${marketplaceAddress}\n`);

  // Salvar endereços em arquivo
  const fs = require("fs");
  const addresses = {
    giroToken: tokenAddress,
    giroMarketplace: marketplaceAddress,
    network: hre.network.name,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    `./deployments/${hre.network.name}-addresses.json`,
    JSON.stringify(addresses, null, 2)
  );

  console.log("📝 Endereços salvos em deployments/");
  console.log(JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
