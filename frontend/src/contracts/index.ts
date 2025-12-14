// Configuração dos contratos
export const CONTRACTS = {
  GIRO_TOKEN: {
    address: (import.meta.env.VITE_GIRO_TOKEN_ADDRESS as `0x${string}`) || "",
    // ABI importado de ./giroToken.ts
  },
  GIRO_MARKETPLACE: {
    address: (import.meta.env.VITE_GIRO_MARKETPLACE_ADDRESS as `0x${string}`) || "",
    // ABI importado de ./giroMarketplace.ts
  },
};

// Exports das ABIs
export { giroTokenABI } from "./giroToken";
export { GIRO_MARKETPLACE_ABI } from "./giroMarketplace";

// Type para estrutura de Produto
export interface Product {
  id: bigint;
  seller: string;
  title: string;
  description: string;
  priceInGiro: bigint;
  sold: boolean;
  createdAt: bigint;
  soldAt: bigint;
  buyer: string;
}
