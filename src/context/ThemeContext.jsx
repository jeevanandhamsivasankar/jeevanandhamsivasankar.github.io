import { createContext, useContext, useMemo } from "react";
import { useTheme } from "../hooks/useTheme.js";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { theme, isDay, isManual, toggle, now } = useTheme();
  const value = useMemo(
    () => ({ theme, isDay, isManual, toggle, now }),
    [theme, isDay, isManual, toggle, now],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error("useThemeContext must be used within ThemeProvider");
  return ctx;
}
