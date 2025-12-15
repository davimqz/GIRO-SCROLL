// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GiroToken is ERC20, Ownable {
    mapping(address => bool) public hasClaimedOnboarding;
    uint256 public constant ONBOARDING_AMOUNT = 50 * 10 ** 18; // 50 tokens

    constructor() ERC20("Giro Token", "GIRO") Ownable(msg.sender) {
        // Mint 1,000,000 tokens (18 decimais)
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    function claimOnboarding() public returns (bool) {
        require(!hasClaimedOnboarding[msg.sender], "Already claimed onboarding bonus");
        
        hasClaimedOnboarding[msg.sender] = true;
        _mint(msg.sender, ONBOARDING_AMOUNT);
        
        return true;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}

