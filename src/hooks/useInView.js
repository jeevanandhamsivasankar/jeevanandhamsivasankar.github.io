import { useState, useEffect } from "react";

export function useInView(ref, { trackDocumentVisibility = true, threshold = 0 } = {}) {
  const [intersecting, setIntersecting] = useState(() => typeof IntersectionObserver !== "function");
  const [pageVisible, setPageVisible] = useState(
    () => typeof document === "undefined" || document.visibilityState !== "hidden",
  );

  useEffect(() => {
    if (typeof IntersectionObserver !== "function" || !ref.current) return undefined;
    const obs = new IntersectionObserver(
      (entries) => setIntersecting(entries[entries.length - 1].isIntersecting),
      { threshold },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);

  useEffect(() => {
    if (!trackDocumentVisibility || typeof document === "undefined") return undefined;
    const onVis = () => setPageVisible(document.visibilityState !== "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [trackDocumentVisibility]);

  return intersecting && (!trackDocumentVisibility || pageVisible);
}
