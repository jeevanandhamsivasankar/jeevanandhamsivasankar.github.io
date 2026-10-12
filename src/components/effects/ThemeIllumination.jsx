import { createPortal } from "react-dom";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";

/**
 * Backlight "illumination" wash shown while html.theme-switching is set (US-209).
 * Opacity-only; not rendered at all under reduced motion.
 */
export default function ThemeIllumination() {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  if (typeof document === "undefined") return null;
  return createPortal(<div className="theme-illum" aria-hidden="true" data-testid="theme-illum" />, document.body);
}
