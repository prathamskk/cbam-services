export function computeTaxEur(massTonnes: number, factor: number, etsPrice: number) {
  return massTonnes * factor * etsPrice;
}
