import { formatEther } from 'viem';

/**
 * Formata preço de wei para GIRO
 * @param priceWei - Preço em wei (string ou bigint)
 * @returns Preço formatado (ex: "10.5 GIRO")
 */
export function formatPrice(priceWei: string | bigint): string {
  try {
    const giro = formatEther(BigInt(priceWei));
    const number = parseFloat(giro);
    
    // Formata com no máximo 2 casas decimais
    return number % 1 === 0 
      ? `${number.toFixed(0)} GIRO` 
      : `${number.toFixed(2)} GIRO`;
  } catch {
    return '0 GIRO';
  }
}

/**
 * Traduz condição do produto para português
 */
export function translateCondition(condition: string): string {
  const translations: Record<string, string> = {
    new: 'Novo',
    like_new: 'Seminovo',
    good: 'Bom',
    fair: 'Regular',
    poor: 'Ruim',
  };
  return translations[condition] || condition;
}

/**
 * Retorna cor baseada na condição
 */
export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    new: 'bg-green-100 text-green-800',
    like_new: 'bg-blue-100 text-blue-800',
    good: 'bg-yellow-100 text-yellow-800',
    fair: 'bg-orange-100 text-orange-800',
    poor: 'bg-red-100 text-red-800',
  };
  return colors[condition] || 'bg-gray-100 text-gray-800';
}
