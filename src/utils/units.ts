// ─── Unit Conversion Utilities ────────────────────────────────────────────────
// Normalizes and converts units between metric and imperial.
// standard factors: 1 kg = 2.20462 lbs, 1 oz = 29.5735 ml

export function kgToLbs(kg: number): number {
  if (!kg || isNaN(kg)) return 0;
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs: number): number {
  if (!lbs || isNaN(lbs)) return 0;
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function mlToOz(ml: number): number {
  if (!ml || isNaN(ml)) return 0;
  return Math.round(ml / 29.5735);
}

export function ozToMl(oz: number): number {
  if (!oz || isNaN(oz)) return 0;
  return Math.round(oz * 29.5735);
}
