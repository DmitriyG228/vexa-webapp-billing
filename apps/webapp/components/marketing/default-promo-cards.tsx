'use client';

/**
 * Client component wrapper that loads default promo cards.
 * Use this in server components instead of calling getDefaultPromoCards() directly.
 */

import { useMemo } from "react";
import { getDefaultPromoCards } from "@/lib/marketing/get-promo-cards";
import { PromoCards } from "./promo-cards";

export function DefaultPromoCards({ className = "" }: { className?: string }) {
  const cards = useMemo(() => getDefaultPromoCards(), []);
  return <PromoCards cards={cards} className={className} />;
}






