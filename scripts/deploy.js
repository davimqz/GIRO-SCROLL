const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de deploy do GiroToken + GiroMarketplace para Scroll Sepolia
 * 
 * Como rodar:
 * npx hardhat run scripts/deploy.js --network scrollSepolia
 */
async function main() {
  console.log("🚀 Deploying GiroToken + GiroMarketplace to", hre.network.name);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Pega a conta que vai fazer o deploy
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Verifica balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("❌ Account has no ETH! Get testnet ETH from:");
    console.error("   https://sepolia.scroll.io/faucet");
    process.exit(1);
  }

  // Deploy do GiroToken primeiro (com endereço zero para marketplace)
  // Depois atualizamos
  console.log("\n⏳ Deploying GiroToken...");
  
  const initialSupply = 100_000;
  console.log("   Initial Supply:", initialSupply.toLocaleString(), "GIRO");
  console.log("   Max Supply: 10,000,000 GIRO");
  console.log("   Onboarding Reward: 50 GIRO per user");

  const GiroToken = await hre.ethers.getContractFactory("GiroToken");
  const giroToken = await GiroToken.deploy(initialSupply, hre.ethers.ZeroAddress);

  await giroToken.waitForDeployment();
  const giroTokenAddress = await giroToken.getAddress();

  console.log("\n✅ GiroToken deployed!");
  console.log("📍 Contract Address:", giroTokenAddress);

  // ============================================
  // 2️⃣ Deploy do GiroMarketplace
  // ============================================

  console.log("\n⏳ Deploying GiroMarketplace...");
  console.log("   Token Address:", giroTokenAddress);

  const GiroMarketplace = await hre.ethers.getContractFactory("GiroMarketplace");
  const marketplace = await GiroMarketplace.deploy(giroTokenAddress);

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("\n✅ GiroMarketplace deployed!");
  console.log("📍 Contract Address:", marketplaceAddress);

  // ============================================
  // 3️⃣ Atualizar endereço do Marketplace no Token
  // ============================================

  console.log("\n⏳ Updating GiroToken marketplace address...");
  
  const giroTokenInstance = await hre.ethers.getContractAt("GiroToken", giroTokenAddress);
  const updateTx = await giroTokenInstance.setMarketplaceAddress(marketplaceAddress);
  await updateTx.wait();

  console.log("✅ GiroToken marketplace address updated!");

  // Verifica info do contrato
  const name = await giroToken.name();
  const symbol = await giroToken.symbol();
  const decimals = await giroToken.decimals();
  const totalSupply = await giroToken.totalSupply();
  const ownerBalance = await giroToken.balanceOf(deployer.address);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔗 Explorers:");
  console.log("   GiroToken:", `https://sepolia.scrollscan.com/address/${giroTokenAddress}`);
  console.log("   Marketplace:", `https://sepolia.scrollscan.com/address/${marketplaceAddress}`);

  console.log("\n📊 Token Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals.toString());
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "GIRO");
  console.log("   Owner Balance:", hre.ethers.formatEther(ownerBalance), "GIRO");
  console.log("   Available Rewards:", (Number(hre.ethers.formatEther(ownerBalance)) / 50).toFixed(0), "users");

  // ============================================
  // 3️⃣ Salvar informações de deployment
  // ============================================

  // Salva endereço dos contratos em arquivo JSON
  const deploymentInfo = {
    network: hre.network.name,
    giroToken: {
      address: giroTokenAddress,
      name,
      symbol,
      decimals: decimals.toString(),
      initialSupply: hre.ethers.formatEther(totalSupply),
      maxSupply: "10000000",
      ownerBalance: hre.ethers.formatEther(ownerBalance),
      explorerUrl: `https://sepolia.scrollscan.com/address/${giroTokenAddress}`,
    },
    marketplace: {
      address: marketplaceAddress,
      tokenAddress: giroTokenAddress,
      explorerUrl: `https://sepolia.scrollscan.com/address/${marketplaceAddress}`,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${hre.network.name}-${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));

  // Também salva como "latest" para facilitar integração no frontend
  const latestPath = path.join(deploymentsDir, `${hre.network.name}-latest.json`);
  fs.writeFileSync(latestPath, JSON.stringify(deploymentInfo, null, 2));

  console.log("\n💾 Deployment info saved to:");
  console.log("  ", filepath);
  console.log("  ", latestPath);

  // Espera alguns blocos antes de verificar (para o Scrollscan indexar)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting for block confirmations...");
    await giroToken.deploymentTransaction().wait(5);
    
    console.log("\n🔍 Verifying contracts on Scrollscan...");
    try {
      await hre.run("verify:verify", {
        address: giroTokenAddress,
        constructorArguments: [initialSupply, hre.ethers.ZeroAddress],
      });
      console.log("✅ GiroToken verified!");
    } catch (error) {
      console.log("⚠️  GiroToken verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [giroTokenAddress],
      });
      console.log("✅ GiroMarketplace verified!");
    } catch (error) {
      console.log("⚠️  GiroMarketplace verification failed:", error.message);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Add contract addresses to frontend .env:");
  console.log(`      VITE_GIRO_TOKEN_ADDRESS=${giroTokenAddress}`);
  console.log(`      VITE_GIRO_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("   2. Update frontend with ABIs");
  console.log("   3. Test the marketplace in frontend");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
