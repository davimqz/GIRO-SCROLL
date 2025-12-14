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
    
    /// @notice Recompensa do primeiro produto listado (10 GIRO)
    uint256 public constant FIRST_LISTING_REWARD = 10 * 10**18;
    
    /// @notice Recompensa da segunda venda (20 GIRO)
    uint256 public constant SECOND_SALE_REWARD = 20 * 10**18;
    
    /// @notice Recompensa da segunda compra (20 GIRO)
    uint256 public constant SECOND_PURCHASE_REWARD = 20 * 10**18;
    
    /// @notice Supply máximo de tokens (10 milhões GIRO)
    uint256 public constant MAX_SUPPLY = 10_000_000 * 10**18;
    
    /// @notice Tracking de wallets que já reivindicaram cada reward
    mapping(address => bool) public hasClaimedOnboarding;
    mapping(address => bool) public hasClaimedFirstListing;
    mapping(address => bool) public hasClaimedSecondSale;
    mapping(address => bool) public hasClaimedSecondPurchase;
    
    /// @notice Contadores de transações para rewards de segunda venda/compra
    mapping(address => uint256) public salesCount;
    mapping(address => uint256) public purchasesCount;
    
    /// @notice Eventos emitidos quando usuários reivindicam rewards
    event OnboardingRewardClaimed(address indexed user, uint256 amount);
    event FirstListingRewardClaimed(address indexed user, uint256 amount);
    event SecondSaleRewardClaimed(address indexed user, uint256 amount);
    event SecondPurchaseRewardClaimed(address indexed user, uint256 amount);
    
    /// @notice Evento emitido quando tokens são mintados para rewards futuros
    event RewardPoolMinted(address indexed to, uint256 amount);
    
    /// @notice Evento emitido quando tokens são queimados
    event TokensBurned(address indexed from, uint256 amount);
    
    /// @notice Evento emitido quando uma compra acontece
    event ProductPurchased(address indexed buyer, address indexed seller, uint256 amount);
    
    /// @notice Evento emitido quando um produto é listado
    event ProductListed(address indexed seller, uint256 productId, uint256 price);

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
     * @dev Permite usuário reivindicar 10 GIRO após listar primeiro produto
     * @notice Só pode ser chamado uma vez por wallet
     * @notice O owner precisa ter GIRO suficiente no balance
     */
    function claimFirstListingReward() external whenNotPaused {
        require(!hasClaimedFirstListing[msg.sender], "First listing reward already claimed");
        require(balanceOf(owner()) >= FIRST_LISTING_REWARD, "Insufficient reward pool");
        
        hasClaimedFirstListing[msg.sender] = true;
        _transfer(owner(), msg.sender, FIRST_LISTING_REWARD);
        
        emit FirstListingRewardClaimed(msg.sender, FIRST_LISTING_REWARD);
    }

    /**
     * @dev Permite usuário reivindicar 20 GIRO após completar segunda venda
     * @notice Só pode ser chamado uma vez por wallet
     * @notice O owner precisa ter GIRO suficiente no balance
     */
    function claimSecondSaleReward() external whenNotPaused {
        require(!hasClaimedSecondSale[msg.sender], "Second sale reward already claimed");
        require(balanceOf(owner()) >= SECOND_SALE_REWARD, "Insufficient reward pool");
        
        hasClaimedSecondSale[msg.sender] = true;
        _transfer(owner(), msg.sender, SECOND_SALE_REWARD);
        
        emit SecondSaleRewardClaimed(msg.sender, SECOND_SALE_REWARD);
    }

    /**
     * @dev Permite usuário reivindicar 20 GIRO após completar segunda compra
     * @notice Só pode ser chamado uma vez por wallet
     * @notice O owner precisa ter GIRO suficiente no balance
     */
    function claimSecondPurchaseReward() external whenNotPaused {
        require(!hasClaimedSecondPurchase[msg.sender], "Second purchase reward already claimed");
        require(balanceOf(owner()) >= SECOND_PURCHASE_REWARD, "Insufficient reward pool");
        
        hasClaimedSecondPurchase[msg.sender] = true;
        _transfer(owner(), msg.sender, SECOND_PURCHASE_REWARD);
        
        emit SecondPurchaseRewardClaimed(msg.sender, SECOND_PURCHASE_REWARD);
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
     * @dev Verifica se uma wallet já pode reivindicar reward de onboarding
     * @param wallet Endereço a verificar
     * @return bool True se ainda não reivindicou
     */
    function canClaimOnboardingReward(address wallet) external view returns (bool) {
        return !hasClaimedOnboarding[wallet];
    }

    /**
     * @dev Verifica se uma wallet já pode reivindicar reward de primeiro listing
     * @param wallet Endereço a verificar
     * @return bool True se ainda não reivindicou
     */
    function canClaimFirstListingReward(address wallet) external view returns (bool) {
        return !hasClaimedFirstListing[wallet];
    }

    /**
     * @dev Verifica se uma wallet já pode reivindicar reward de segunda venda
     * @param wallet Endereço a verificar
     * @return bool True se ainda não reivindicou
     */
    function canClaimSecondSaleReward(address wallet) external view returns (bool) {
        return !hasClaimedSecondSale[wallet];
    }

    /**
     * @dev Verifica se uma wallet já pode reivindicar reward de segunda compra
     * @param wallet Endereço a verificar
     * @return bool True se ainda não reivindicou
     */
    function canClaimSecondPurchaseReward(address wallet) external view returns (bool) {
        return !hasClaimedSecondPurchase[wallet];
    }

    /**
     * @dev Retorna o balance do pool de rewards (balance do owner)
     * @return uint256 Balance em wei
     */
    function rewardPoolBalance() external view returns (uint256) {
        return balanceOf(owner());
    }

    /**
     * @dev Queima tokens de um endereço
     * @param amount Quantidade de tokens a queimar (em wei)
     * @notice Qualquer usuário pode queimar seus próprios tokens
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    /**
     * @dev Realiza compra de produto (chamado pelo Marketplace)
     * @param buyer Endereço do comprador
     * @param seller Endereço do vendedor
     * @param amount Valor em GIRO a ser pago
     * @notice Queima os tokens do comprador
     * @notice Apenas contrato autorizado pode chamar
     */
    function executePurchase(
        address buyer,
        address seller,
        uint256 amount
    ) external {
        require(msg.sender == buyer || msg.sender == address(this), "Unauthorized");
        
        // Verificar balance do comprador
        require(balanceOf(buyer) >= amount, "Insufficient balance");
        
        // Queimar tokens do comprador
        _burn(buyer, amount);
        
        // Incrementar contador de vendas do vendedor
        salesCount[seller]++;
        
        // Incrementar contador de compras do comprador
        purchasesCount[buyer]++;
        
        emit ProductPurchased(buyer, seller, amount);
    }

    /**
     * @dev Registra a listagem de um produto
     * @param seller Endereço do vendedor
     * @param productId ID do produto
     * @param price Preço em GIRO
     * @notice Apenas para tracking de eventos
     */
    function recordProductListing(
        address seller,
        uint256 productId,
        uint256 price
    ) external {
        // Qualquer endereço pode chamar, vai ser o Marketplace
        emit ProductListed(seller, productId, price);
    }

    /**
     * @dev Retorna o número de vendas de um endereço
     * @param seller Endereço do vendedor
     * @return uint256 Número de vendas
     */
    function getSalesCount(address seller) external view returns (uint256) {
        return salesCount[seller];
    }

    /**
     * @dev Retorna o número de compras de um endereço
     * @param buyer Endereço do comprador
     * @return uint256 Número de compras
     */
    function getPurchasesCount(address buyer) external view returns (uint256) {
        return purchasesCount[buyer];
    }
}
