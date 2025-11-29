/**
 * Helper to convert promo card data to PromoCard format.
 * This file is separate to avoid circular dependencies.
 * 
 * IMPORTANT: This function must be called at runtime (in components), not at module initialization.
 * This ensures JSX is NOT created during webpack compilation.
 */

import { defaultPromoCardsData } from "./content";
import { convertPromoCardData, PromoCard } from "@/components/marketing/promo-cards";

let _cachedPromoCards: PromoCard[] | null = null;

/**
 * Convert promo card data to PromoCard format (with JSX).
 * This function MUST be called at runtime (in React components), not during module initialization.
 * Uses lazy initialization with caching - JSX is only created when first accessed.
 */
export function getDefaultPromoCards(): PromoCard[] {
  if (_cachedPromoCards === null) {
    _cachedPromoCards = defaultPromoCardsData.map(convertPromoCardData);
  }
  return _cachedPromoCards;
}

