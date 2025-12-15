const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GiroToken", function () {
  let giroToken;
  let owner;
  let user1;
  let user2;
  const INITIAL_SUPPLY = 100_000; // 100k tokens
  const ONBOARDING_REWARD = ethers.parseEther("50"); // 50 GIRO

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const GiroToken = await ethers.getContractFactory("GiroToken");
    giroToken = await GiroToken.deploy(INITIAL_SUPPLY);
    await giroToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await giroToken.name()).to.equal("Giro Token");
      expect(await giroToken.symbol()).to.equal("GIRO");
    });

    it("Should have 18 decimals", async function () {
      expect(await giroToken.decimals()).to.equal(18);
    });

    it("Should mint initial supply to owner", async function () {
      const ownerBalance = await giroToken.balanceOf(owner.address);
      const expectedBalance = ethers.parseEther(INITIAL_SUPPLY.toString());
      expect(ownerBalance).to.equal(expectedBalance);
    });

    it("Should set correct max supply", async function () {
      const maxSupply = await giroToken.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.parseEther("10000000")); // 10M
    });

    it("Should set correct onboarding reward", async function () {
      const reward = await giroToken.ONBOARDING_REWARD();
      expect(reward).to.equal(ONBOARDING_REWARD);
    });

    it("Should set deployer as owner", async function () {
      expect(await giroToken.owner()).to.equal(owner.address);
    });
  });

  describe("Onboarding Rewards", function () {
    it("Should allow user to claim onboarding reward", async function () {
      const initialBalance = await giroToken.balanceOf(user1.address);
      expect(initialBalance).to.equal(0);

      await giroToken.connect(user1).claimOnboardingReward();

      const finalBalance = await giroToken.balanceOf(user1.address);
      expect(finalBalance).to.equal(ONBOARDING_REWARD);
    });

    it("Should mark user as claimed after reward", async function () {
      expect(await giroToken.hasClaimedOnboarding(user1.address)).to.be.false;
      
      await giroToken.connect(user1).claimOnboardingReward();
      
      expect(await giroToken.hasClaimedOnboarding(user1.address)).to.be.true;
    });

    it("Should emit OnboardingRewardClaimed event", async function () {
      await expect(giroToken.connect(user1).claimOnboardingReward())
        .to.emit(giroToken, "OnboardingRewardClaimed")
        .withArgs(user1.address, ONBOARDING_REWARD);
    });

    it("Should prevent double claiming", async function () {
      await giroToken.connect(user1).claimOnboardingReward();
      
      await expect(
        giroToken.connect(user1).claimOnboardingReward()
      ).to.be.revertedWith("Reward already claimed");
    });

    it("Should allow multiple different users to claim", async function () {
      await giroToken.connect(user1).claimOnboardingReward();
      await giroToken.connect(user2).claimOnboardingReward();

      expect(await giroToken.balanceOf(user1.address)).to.equal(ONBOARDING_REWARD);
      expect(await giroToken.balanceOf(user2.address)).to.equal(ONBOARDING_REWARD);
    });

    it("Should fail if owner has insufficient balance", async function () {
      // Transfer tudo do owner
      const ownerBalance = await giroToken.balanceOf(owner.address);
      await giroToken.transfer(user2.address, ownerBalance);

      await expect(
        giroToken.connect(user1).claimOnboardingReward()
      ).to.be.revertedWith("Insufficient reward pool");
    });

    it("Should return correct canClaimOnboardingReward status", async function () {
      expect(await giroToken.canClaimOnboardingReward(user1.address)).to.be.true;
      
      await giroToken.connect(user1).claimOnboardingReward();
      
      expect(await giroToken.canClaimOnboardingReward(user1.address)).to.be.false;
    });
  });

  describe("Reward Pool Management", function () {
    it("Should return correct reward pool balance", async function () {
      const ownerBalance = await giroToken.balanceOf(owner.address);
      const poolBalance = await giroToken.rewardPoolBalance();
      expect(poolBalance).to.equal(ownerBalance);
    });

    it("Should allow owner to mint additional rewards", async function () {
      const additionalAmount = ethers.parseEther("10000");
      const initialSupply = await giroToken.totalSupply();

      await giroToken.mintRewardPool(additionalAmount);

      const newSupply = await giroToken.totalSupply();
      expect(newSupply).to.equal(initialSupply + additionalAmount);
    });

    it("Should emit RewardPoolMinted event", async function () {
      const amount = ethers.parseEther("5000");
      
      await expect(giroToken.mintRewardPool(amount))
        .to.emit(giroToken, "RewardPoolMinted")
        .withArgs(owner.address, amount);
    });

    it("Should prevent minting beyond max supply", async function () {
      const maxSupply = await giroToken.MAX_SUPPLY();
      const currentSupply = await giroToken.totalSupply();
      const excessAmount = maxSupply - currentSupply + ethers.parseEther("1");

      await expect(
        giroToken.mintRewardPool(excessAmount)
      ).to.be.revertedWith("Would exceed max supply");
    });

    it("Should only allow owner to mint rewards", async function () {
      await expect(
        giroToken.connect(user1).mintRewardPool(ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(giroToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pause Functionality", function () {
    it("Should allow owner to pause transfers", async function () {
      await giroToken.pause();
      expect(await giroToken.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      await giroToken.pause();

      await expect(
        giroToken.transfer(user1.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(giroToken, "EnforcedPause");
    });

    it("Should prevent claiming rewards when paused", async function () {
      await giroToken.pause();

      await expect(
        giroToken.connect(user1).claimOnboardingReward()
      ).to.be.revertedWithCustomError(giroToken, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await giroToken.pause();
      await giroToken.unpause();
      expect(await giroToken.paused()).to.be.false;

      // Deve permitir transfers novamente
      await expect(
        giroToken.transfer(user1.address, ethers.parseEther("100"))
      ).to.not.be.reverted;
    });

    it("Should only allow owner to pause/unpause", async function () {
      await expect(
        giroToken.connect(user1).pause()
      ).to.be.revertedWithCustomError(giroToken, "OwnableUnauthorizedAccount");

      await giroToken.pause();

      await expect(
        giroToken.connect(user1).unpause()
      ).to.be.revertedWithCustomError(giroToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Standard ERC20 Functions", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.parseEther("100");
      
      await giroToken.transfer(user1.address, amount);
      expect(await giroToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("Should allow approved transfers", async function () {
      const amount = ethers.parseEther("100");
      
      await giroToken.approve(user1.address, amount);
      await giroToken.connect(user1).transferFrom(owner.address, user2.address, amount);
      
      expect(await giroToken.balanceOf(user2.address)).to.equal(amount);
    });

    it("Should update allowances correctly", async function () {
      const amount = ethers.parseEther("100");
      
      await giroToken.approve(user1.address, amount);
      expect(await giroToken.allowance(owner.address, user1.address)).to.equal(amount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle claiming with exact reward pool balance", async function () {
      // Transfer para deixar apenas 50 GIRO no owner
      const ownerBalance = await giroToken.balanceOf(owner.address);
      const excess = ownerBalance - ONBOARDING_REWARD;
      await giroToken.transfer(user2.address, excess);

      // User1 deve conseguir reivindicar
      await expect(
        giroToken.connect(user1).claimOnboardingReward()
      ).to.not.be.reverted;

      expect(await giroToken.balanceOf(owner.address)).to.equal(0);
    });

    it("Should reject deployment with initial supply > max supply", async function () {
      const GiroToken = await ethers.getContractFactory("GiroToken");
      
      await expect(
        GiroToken.deploy(10_000_001) // 1 token a mais que o máximo
      ).to.be.revertedWith("Initial supply exceeds max supply");
    });
  });

  describe("Gas Optimization", function () {
    it("Should have reasonable gas cost for claiming reward", async function () {
      const tx = await giroToken.connect(user1).claimOnboardingReward();
      const receipt = await tx.wait();
      
      console.log("       Gas used for claimOnboardingReward:", receipt.gasUsed.toString());
      
      // Deve usar menos de 100k gas
      expect(receipt.gasUsed).to.be.lessThan(100000);
    });
  });
});
