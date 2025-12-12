// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title GiroToken
 * @dev ERC20 Token para o marketplace Giro na Scroll Network
 * @notice Os usuários recebem 50 GIRO ao completar o onboarding
 */
contract GiroToken is ERC20, Ownable, Pausable {
    /// @notice Recompensa fixa de onboarding (50 GIRO)
    uint256 public constant ONBOARDING_REWARD = 50 * 10**18;
    
    /// @notice Supply máximo de tokens (10 milhões GIRO)
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;
    
    /// @notice Tracking de wallets que já reivindicaram o reward
    mapping(address => bool) public hasClaimedOnboarding;
    
    /// @notice Evento emitido quando um usuário reivindica o reward
    event OnboardingRewardClaimed(address indexed user, uint256 amount);
    
    /// @notice Evento emitido quando tokens são mintados para rewards futuros
    event RewardPoolMinted(address indexed to, uint256 amount);

    /**
     * @dev Constructor - minta supply inicial para o owner (usado para rewards)
     * @param initialSupply Supply inicial para o pool de rewards (em tokens, não wei)
     */
    constructor(uint256 initialSupply) ERC20("Giro Token", "GIRO") Ownable(msg.sender) {
        require(initialSupply * 10**18 <= MAX_SUPPLY, "Initial supply exceeds max supply");
        _mint(msg.sender, initialSupply * 10**18);
    }

    /**
     * @dev Permite usuário reivindicar 50 GIRO após completar onboarding
     * @notice Só pode ser chamado uma vez por wallet
     * @notice O owner precisa ter GIRO suficiente no balance
     */
    function claimOnboardingReward() external whenNotPaused {
        require(!hasClaimedOnboarding[msg.sender], "Reward already claimed");
        require(balanceOf(owner()) >= ONBOARDING_REWARD, "Insufficient reward pool");
        
        hasClaimedOnboarding[msg.sender] = true;
        _transfer(owner(), msg.sender, ONBOARDING_REWARD);
        
        emit OnboardingRewardClaimed(msg.sender, ONBOARDING_REWARD);
    }

    /**
     * @dev Permite owner mintar tokens adicionais para o pool de rewards
     * @param amount Quantidade de tokens a mintar (em wei)
     * @notice Não pode exceder MAX_SUPPLY
     */
    function mintRewardPool(uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed max supply");
        _mint(owner(), amount);
        emit RewardPoolMinted(owner(), amount);
    }

    /**
     * @dev Pausa transferências (emergência)
     * @notice Apenas o owner pode pausar
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Despausa transferências
     * @notice Apenas o owner pode despausar
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Hook do OpenZeppelin - bloqueia transfers quando pausado
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override whenNotPaused {
        super._update(from, to, value);
    }

    /**
     * @dev Verifica se uma wallet já pode reivindicar reward
     * @param wallet Endereço a verificar
     * @return bool True se ainda não reivindicou
     */
    function canClaimReward(address wallet) external view returns (bool) {
        return !hasClaimedOnboarding[wallet];
    }

    /**
     * @dev Retorna o balance do pool de rewards (balance do owner)
     * @return uint256 Balance em wei
     */
    function rewardPoolBalance() external view returns (uint256) {
        return balanceOf(owner());
    }
}
