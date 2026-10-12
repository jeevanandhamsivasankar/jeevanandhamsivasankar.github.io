import { useState, useEffect } from "react";

/**
 * True while the document is visible (tab foregrounded). Re-renders only on visibility change.
 * @returns {boolean}
 */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const onVis = () => setVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return visible;
}
