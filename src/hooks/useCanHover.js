import { canHover } from "../lib/hover.js";

/** False on touch-only devices so JS hover styling does not stick (US-210). */
export function useCanHover() {
  return canHover();
}
