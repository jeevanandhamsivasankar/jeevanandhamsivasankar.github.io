import { useState, useEffect } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const hasMatchMedia = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    hasMatchMedia() ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false,
  );
  useEffect(() => {
    if (!hasMatchMedia()) return undefined;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (e) => setReduced(e.matches);
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);
  return reduced;
}
