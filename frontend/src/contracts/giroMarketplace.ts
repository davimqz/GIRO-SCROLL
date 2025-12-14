// Auto-generated ABI from artifacts/contracts/GiroMarketplace.sol/GiroMarketplace.json
// Do not edit manually - regenerate from hardhat compile

export const GIRO_MARKETPLACE_ABI = [
  {
    inputs: [{ internalType: "address", name: "_giroTokenAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
    ],
    name: "ProductCancelled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      { indexed: false, internalType: "uint256", name: "priceInGiro", type: "uint256" },
    ],
    name: "ProductCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "productId", type: "uint256" },
      { indexed: true, internalType: "address", name: "seller", type: "address" },
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: false, internalType: "uint256", name: "priceInGiro", type: "uint256" },
    ],
    name: "ProductSold",
    type: "event",
  },
  {
    inputs: [{ internalType: "uint256", name: "_productId", type: "uint256" }],
    name: "buyProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_productId", type: "uint256" }],
    name: "cancelProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "giroToken",
    outputs: [{ internalType: "contract GiroToken", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveProducts",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_productId", type: "uint256" }],
    name: "getProduct",
    outputs: [
      {
        components: [
          { internalType: "uint256", name: "id", type: "uint256" },
          { internalType: "address", name: "seller", type: "address" },
          { internalType: "string", name: "title", type: "string" },
          { internalType: "string", name: "description", type: "string" },
          { internalType: "uint256", name: "priceInGiro", type: "uint256" },
          { internalType: "bool", name: "sold", type: "bool" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "uint256", name: "soldAt", type: "uint256" },
          { internalType: "address", name: "buyer", type: "address" },
        ],
        internalType: "struct GiroMarketplace.Product",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "_seller", type: "address" }],
    name: "getSellerProducts",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalProducts",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "uint256", name: "_priceInGiro", type: "uint256" },
    ],
    name: "listProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "products",
    outputs: [
      { internalType: "uint256", name: "id", type: "uint256" },
      { internalType: "address", name: "seller", type: "address" },
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "priceInGiro", type: "uint256" },
      { internalType: "bool", name: "sold", type: "bool" },
      { internalType: "uint256", name: "createdAt", type: "uint256" },
      { internalType: "uint256", name: "soldAt", type: "uint256" },
      { internalType: "address", name: "buyer", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "productCounter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const GIRO_MARKETPLACE_ADDRESS = (import.meta.env.VITE_GIRO_MARKETPLACE_ADDRESS as `0x${string}`) || "";
