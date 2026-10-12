import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { getSunPhase, DEFAULT_GEO } from "../lib/solar.js";
import { readThemeOverride, writeThemeOverride } from "../lib/storage.js";

export const THEME_RECHECK_MS = 60000;
export const CLOCK_TICK_MS = 60000;

/**
 * Theme state machine: automatic Chennai theme, manual override, clock.
 * @param {{ geo?: object, storage?: Storage }} [options]
 */
export function useTheme({ geo = DEFAULT_GEO, storage } = {}) {
  const [init] = useState(() => {
    const stored = readThemeOverride(storage);
    return stored
      ? { theme: stored, manual: true }
      : { theme: getSunPhase(new Date(), geo), manual: false };
  });
  const [theme, setTheme] = useState(init.theme);
  const [manual, setManual] = useState(init.manual);
  const [now, setNow] = useState(() => new Date());

  useLayoutEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (manual) return undefined;
    const id = setInterval(() => setTheme(getSunPhase(new Date(), geo)), THEME_RECHECK_MS);
    return () => clearInterval(id);
  }, [manual, geo]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const toggle = useCallback(() => {
    setManual(true);
    setTheme((t) => (t === "day" ? "night" : "day"));
  }, []);

  useEffect(() => {
    if (manual) writeThemeOverride(theme, storage);
  }, [manual, theme, storage]);

  return { theme, isDay: theme === "day", isManual: manual, toggle, now };
}
