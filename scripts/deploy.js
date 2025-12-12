const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de deploy do GiroToken para Scroll Sepolia
 * 
 * Como rodar:
 * npx hardhat run scripts/deploy.js --network scrollSepolia
 */
async function main() {
  console.log("🚀 Deploying GiroToken to", hre.network.name);
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

  // Deploy do contrato
  // Initial supply = 100,000 GIRO (suficiente para 2000 onboardings)
  const initialSupply = 100_000;
  
  console.log("\n⏳ Deploying GiroToken...");
  console.log("   Initial Supply:", initialSupply.toLocaleString(), "GIRO");
  console.log("   Max Supply: 10,000,000 GIRO");
  console.log("   Onboarding Reward: 50 GIRO per user");

  const GiroToken = await hre.ethers.getContractFactory("GiroToken");
  const giroToken = await GiroToken.deploy(initialSupply);

  await giroToken.waitForDeployment();
  const contractAddress = await giroToken.getAddress();

  console.log("\n✅ GiroToken deployed!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("🔗 Explorer:", `https://sepolia.scrollscan.com/address/${contractAddress}`);
  console.log("👤 Owner:", deployer.address);

  // Verifica info do contrato
  const name = await giroToken.name();
  const symbol = await giroToken.symbol();
  const decimals = await giroToken.decimals();
  const totalSupply = await giroToken.totalSupply();
  const ownerBalance = await giroToken.balanceOf(deployer.address);

  console.log("\n📊 Token Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Decimals:", decimals.toString());
  console.log("   Total Supply:", hre.ethers.formatEther(totalSupply), "GIRO");
  console.log("   Owner Balance:", hre.ethers.formatEther(ownerBalance), "GIRO");
  console.log("   Available Rewards:", (Number(hre.ethers.formatEther(ownerBalance)) / 50).toFixed(0), "users");

  // Salva endereço do contrato em arquivo JSON
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    tokenInfo: {
      name,
      symbol,
      decimals: decimals.toString(),
      initialSupply: hre.ethers.formatEther(totalSupply),
      onboardingReward: "50",
      maxSupply: "10000000",
    },
    explorerUrl: `https://sepolia.scrollscan.com/address/${contractAddress}`,
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
    
    console.log("\n🔍 Verifying contract on Scrollscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [initialSupply],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
      console.log("   You can verify manually with:");
      console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress} ${initialSupply}`);
    }
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Deployment complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Add contract address to frontend .env:");
  console.log(`      VITE_GIRO_TOKEN_ADDRESS=${contractAddress}`);
  console.log("   2. Add to Supabase for backend integration");
  console.log("   3. Test claiming reward with a test wallet");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
