import { useRef, useEffect } from "react";

export function useParallax({ enabled = true } = {}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return undefined;
    const onMove = (e) => {
      const el = ref.current;
      if (!el) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      el.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(8px)`;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (ref.current) ref.current.style.transform = "";
    };
  }, [enabled]);
  return ref;
}
