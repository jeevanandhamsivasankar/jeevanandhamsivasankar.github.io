import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";

export default function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef(null);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    };
    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!frame) frame = window.requestAnimationFrame(paint);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduced]);

  if (reduced) return null;
  return <div ref={ref} className="cursor-glow" style={{ left: -500, top: -500 }} aria-hidden="true" />;
}
