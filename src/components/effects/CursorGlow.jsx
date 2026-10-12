import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";

export default function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e) => {
      const el = ref.current;
      if (!el) return;
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" style={{ left: -500, top: -500 }} aria-hidden="true" />;
}
