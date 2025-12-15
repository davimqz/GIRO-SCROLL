// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GiroToken.sol";

/**
 * @title GiroMarketplace
 * @dev Marketplace para economia circular na Scroll Network
 * @notice Permite usuários listar e comprar produtos com tokens GIRO
 */
contract GiroMarketplace {
    /// @notice Referência ao contrato de token
    GiroToken public giroToken;
    
    /// @notice Estrutura de um produto
    struct Product {
        uint256 id;
        address seller;
        string title;
        string description;
        uint256 priceInGiro;
        bool sold;
        uint256 createdAt;
        uint256 soldAt;
        address buyer;
    }
    
    /// @notice Contador de produtos
    uint256 public productCounter = 0;
    
    /// @notice Mapping de produtos
    mapping(uint256 => Product) public products;
    
    /// @notice Eventos
    event ProductCreated(
        uint256 indexed productId,
        address indexed seller,
        string title,
        uint256 priceInGiro
    );
    
    event ProductSold(
        uint256 indexed productId,
        address indexed seller,
        address indexed buyer,
        uint256 priceInGiro
    );
    
    event ProductCancelled(
        uint256 indexed productId,
        address indexed seller
    );

    /**
     * @dev Constructor - inicializa com endereço do token
     * @param _giroTokenAddress Endereço do contrato GiroToken
     */
    constructor(address _giroTokenAddress) {
        require(_giroTokenAddress != address(0), "Invalid token address");
        giroToken = GiroToken(_giroTokenAddress);
    }

    /**
     * @dev Cria um novo produto para venda
     * @param _title Título do produto
     * @param _description Descrição do produto
     * @param _priceInGiro Preço em tokens GIRO
     * @notice Qualquer usuário pode listar um produto
     */
    function listProduct(
        string memory _title,
        string memory _description,
        uint256 _priceInGiro
    ) external {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_priceInGiro > 0, "Price must be greater than 0");
        
        uint256 productId = productCounter++;
        
        products[productId] = Product({
            id: productId,
            seller: msg.sender,
            title: _title,
            description: _description,
            priceInGiro: _priceInGiro,
            sold: false,
            createdAt: block.timestamp,
            soldAt: 0,
            buyer: address(0)
        });
        
        // Registra a listagem no contrato de token (para eventos)
        giroToken.recordProductListing(msg.sender, productId, _priceInGiro);
        
        emit ProductCreated(productId, msg.sender, _title, _priceInGiro);
    }

    /**
     * @dev Compra um produto
     * @param _productId ID do produto a comprar
     * @notice Comprador precisa ter saldo suficiente em GIRO
     * @notice Os tokens são transferidos para o vendedor
     */
    function buyProduct(uint256 _productId) external {
        Product storage product = products[_productId];
        
        require(product.id == _productId, "Product does not exist");
        require(!product.sold, "Product already sold");
        require(product.seller != msg.sender, "Seller cannot buy their own product");
        require(giroToken.balanceOf(msg.sender) >= product.priceInGiro, "Insufficient GIRO balance");
        
        // Marca como vendido
        product.sold = true;
        product.soldAt = block.timestamp;
        product.buyer = msg.sender;
        
        // Queima os tokens do comprador (deflationary)
        giroToken.executePurchase(msg.sender, product.seller, product.priceInGiro);
        
        emit ProductSold(_productId, product.seller, msg.sender, product.priceInGiro);
    }

    /**
     * @dev Cancela a listagem de um produto (apenas o criador)
     * @param _productId ID do produto a cancelar
     */
    function cancelProduct(uint256 _productId) external {
        Product storage product = products[_productId];
        
        require(product.id == _productId, "Product does not exist");
        require(product.seller == msg.sender, "Only seller can cancel");
        require(!product.sold, "Cannot cancel sold product");
        
        product.sold = true; // Marca como indisponível
        
        emit ProductCancelled(_productId, msg.sender);
    }

    /**
     * @dev Retorna informações de um produto
     * @param _productId ID do produto
     * @return Product struct com os dados do produto
     */
    function getProduct(uint256 _productId) external view returns (Product memory) {
        return products[_productId];
    }

    /**
     * @dev Retorna produtos ativos de um vendedor
     * @param _seller Endereço do vendedor
     * @return Array com IDs dos produtos ativos
     */
    function getSellerProducts(address _seller) external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Primeira passada: contar produtos ativos
        for (uint256 i = 0; i < productCounter; i++) {
            if (products[i].seller == _seller && !products[i].sold) {
                count++;
            }
        }
        
        // Segunda passada: adicionar ao array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < productCounter; i++) {
            if (products[i].seller == _seller && !products[i].sold) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Retorna todos os produtos ativos
     * @return Array com IDs de todos os produtos ativos
     */
    function getActiveProducts() external view returns (uint256[] memory) {
        uint256 count = 0;
        
        // Primeira passada: contar produtos ativos
        for (uint256 i = 0; i < productCounter; i++) {
            if (!products[i].sold) {
                count++;
            }
        }
        
        // Segunda passada: adicionar ao array
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < productCounter; i++) {
            if (!products[i].sold) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }

    /**
     * @dev Retorna total de produtos
     * @return uint256 Total de produtos criados
     */
    function getTotalProducts() external view returns (uint256) {
        return productCounter;
    }
}
