import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import { useInView } from "../../hooks/useInView.js";
import { GAUGE, gaugeFrame, speedAngle, rpmAngle, arcPath, needlePoint, gaugeTicks } from "../../lib/gauge.js";

const TICKS = gaugeTicks();
const arc = arcPath;
const { cx, cy, r, minA, maxA } = GAUGE;

export default function Speedometer() {
  const svgRef = useRef(null);
  const tRef = useRef(0);
  const [frame, setFrame] = useState(() => gaugeFrame(0));
  const reduced = usePrefersReducedMotion();
  const inView = useInView(svgRef);
  const running = inView && !reduced;

  useEffect(() => {
    if (!running) return;
    let id = requestAnimationFrame(function tick() {
      tRef.current += GAUGE.dt;
      setFrame(gaugeFrame(tRef.current));
      id = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(id);
  }, [running]);

  const { speed, rpm } = reduced ? gaugeFrame(0) : frame;
  const sAngle = speedAngle(speed);
  const rAngle = rpmAngle(rpm);
  const { x: nx, y: ny } = needlePoint(sAngle);

  return (
    <svg ref={svgRef} viewBox="0 0 260 260" style={{ width: "100%", maxWidth: 320, height: "auto" }} role="img" aria-label="HMI cluster demo gauge">
      <defs>
        <radialGradient id="gbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#111d30" /><stop offset="100%" stopColor="#060c18" />
        </radialGradient>
        <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="rpmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="softGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle cx={cx} cy={cy} r={122} fill="url(#gbg)" stroke="rgba(245,158,11,0.15)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={112} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <path d={arc(cx, cy, 112, -215, 35)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" strokeLinecap="round" />
      <path d={arc(cx, cy, 112, -215, rAngle)} fill="none" stroke="url(#rpmGrad)" strokeWidth="5" strokeLinecap="round" filter="url(#glow)" />
      <path d={arc(cx, cy, r, minA, maxA)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="9" strokeLinecap="round" />
      <path d={arc(cx, cy, r, minA, sAngle)} fill="none" stroke="url(#arcGrad)" strokeWidth="9" strokeLinecap="round" filter="url(#glow)" />
      {TICKS.map((tk, i) => (
        <line key={i} x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
          stroke={tk.major ? "rgba(245,158,11,0.55)" : "rgba(255,255,255,0.14)"} strokeWidth={tk.major ? 2 : 1} />
      ))}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="url(#needleGrad)" strokeWidth="2.5" strokeLinecap="round" filter="url(#softGlow)" />
      <circle cx={cx} cy={cy} r={8} fill="#f59e0b" filter="url(#glow)" />
      <circle cx={cx} cy={cy} r={3.5} fill="#060c18" />
      <text x={cx} y={cy + 30} textAnchor="middle" fill="#e2e8f0" fontFamily="'Share Tech Mono',monospace" fontSize="30" fontWeight="bold">{Math.round(speed)}</text>
      <text x={cx} y={cy + 47} textAnchor="middle" fill="rgba(245,158,11,0.7)" fontFamily="'Share Tech Mono',monospace" fontSize="10" letterSpacing="0.2em">km/h</text>
      <text x={cx} y={cy - 30} textAnchor="middle" fill="rgba(34,211,238,0.6)" fontFamily="'Share Tech Mono',monospace" fontSize="8.5" letterSpacing="0.2em">HMI CLUSTER DEMO</text>
      <text x={cx} y={cy + 66} textAnchor="middle" fill="rgba(251,113,133,0.6)" fontFamily="'Share Tech Mono',monospace" fontSize="8">{Math.round(rpm)} RPM</text>
    </svg>
  );
}
