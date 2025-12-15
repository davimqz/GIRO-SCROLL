// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GiroMarketplace is Ownable {
    IERC20 public giroToken;

    struct Post {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        string imageIpfs;
        uint256 price;
        uint256 createdAt;
        bool sold;
    }

    struct Purchase {
        uint256 postId;
        address buyer;
        uint256 purchasedAt;
    }

    uint256 public nextPostId = 1;

    mapping(uint256 => Post) public posts;
    mapping(uint256 => Purchase[]) public postPurchases;
    mapping(address => uint256[]) public userPosts;
    mapping(address => uint256[]) public userPurchases;

    event PostCreated(
        uint256 indexed postId,
        address indexed creator,
        string title,
        string description,
        string category,
        string imageIpfs,
        uint256 price
    );
    event PostPurchased(uint256 indexed postId, address indexed buyer, address indexed creator, uint256 price);

    constructor(address _giroTokenAddress) Ownable(msg.sender) {
        giroToken = IERC20(_giroTokenAddress);
    }

    // Criar post
    function createPost(
        string memory _title,
        string memory _description,
        string memory _category,
        string memory _imageIpfs,
        uint256 _price
    ) public returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(bytes(_imageIpfs).length > 0, "Image IPFS hash cannot be empty");

        uint256 postId = nextPostId;
        posts[postId] = Post({
            id: postId,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            imageIpfs: _imageIpfs,
            price: _price,
            createdAt: block.timestamp,
            sold: false
        });

        userPosts[msg.sender].push(postId);
        nextPostId++;

        emit PostCreated(postId, msg.sender, _title, _description, _category, _imageIpfs, _price);
        return postId;
    }

    // Comprar post
    function buyPost(uint256 _postId) public returns (bool) {
        Post storage post = posts[_postId];
        require(post.id != 0, "Post does not exist");
        require(msg.sender != post.creator, "Cannot buy your own post");
        require(!post.sold, "Post already sold");

        // Transferir tokens integralmente para o criador
        require(
            giroToken.transferFrom(msg.sender, post.creator, post.price),
            "Transfer failed"
        );

        // Marcar como vendido
        post.sold = true;

        // Registrar compra
        Purchase memory purchase = Purchase({
            postId: _postId,
            buyer: msg.sender,
            purchasedAt: block.timestamp
        });
        postPurchases[_postId].push(purchase);
        userPurchases[msg.sender].push(_postId);

        emit PostPurchased(_postId, msg.sender, post.creator, post.price);
        return true;
    }

    // Pegar post
    function getPost(uint256 _postId) public view returns (Post memory) {
        return posts[_postId];
    }

    // Pegar posts do usuário
    function getUserPosts(address _user) public view returns (uint256[] memory) {
        return userPosts[_user];
    }

    // Pegar compras do usuário
    function getUserPurchases(address _user) public view returns (uint256[] memory) {
        return userPurchases[_user];
    }

    // Pegar histórico de compras de um post
    function getPostPurchases(uint256 _postId) public view returns (Purchase[] memory) {
        return postPurchases[_postId];
    }
}
