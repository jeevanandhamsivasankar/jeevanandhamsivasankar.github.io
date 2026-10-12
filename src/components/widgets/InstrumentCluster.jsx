import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion.js";
import { useInView } from "../../hooks/useInView.js";
import { useDocumentVisible } from "../../hooks/useDocumentVisible.js";
import { arcPath } from "../../lib/gauge.js";
import {
  CLUSTER, createSim, advance, staticSim, snapshot, canLine, pushTicker, createRng,
} from "../../lib/cluster.js";

const { speed: SPD, rpm: RPM, minA, maxA } = CLUSTER;
const rad = (d) => (d * Math.PI) / 180;
const pt = (d, r, a) => [d.cx + r * Math.cos(rad(a)), d.cy + r * Math.sin(rad(a))];
const fx = (n) => Math.round(n * 100) / 100;

/** Static dial furniture, computed once at module load (painted once, never per frame). */
function dialFace(d, majorEvery, minors, labelFn) {
  const out = [];
  for (let i = 0; i <= minors; i += 1) {
    const a = minA + ((maxA - minA) * i) / minors;
    const major = i % majorEvery === 0;
    const [x0, y0] = pt(d, d.r - 10, a);
    const [x1, y1] = pt(d, d.r - (major ? 30 : 20), a);
    const [tx, ty] = pt(d, d.r - 46, a);
    out.push({ i, major, x0: fx(x0), y0: fx(y0), x1: fx(x1), y1: fx(y1), tx: fx(tx), ty: fx(ty), label: major ? labelFn(i / minors) : null });
  }
  return out;
}
const SPD_FACE = dialFace(SPD, 2, 20, (f) => Math.round(f * SPD.max));
const RPM_FACE = dialFace(RPM, 2, 16, (f) => Math.round(f * 8));
const ARC_SPD = arcPath(SPD.cx, SPD.cy, SPD.r, minA, maxA);
const ARC_RPM = arcPath(RPM.cx, RPM.cy, RPM.r, minA, maxA);
const REDZONE = arcPath(RPM.cx, RPM.cy, RPM.r - 15, minA + ((maxA - minA) * RPM.red) / RPM.max, maxA);

function Dial({ d, face }) {
  return (
    <g>
      <circle cx={d.cx} cy={d.cy} r={d.r + 26} className="cl-bezel" />
      <circle cx={d.cx} cy={d.cy} r={d.r + 14} className="cl-bezel2" />
      <path d={arcPath(d.cx, d.cy, d.r, minA, maxA)} className="cl-track" />
      {face.map((t) => (
        <g key={t.i}>
          <line x1={t.x0} y1={t.y0} x2={t.x1} y2={t.y1} className={t.major ? "cl-tick-major" : "cl-tick"} />
          {t.label !== null && <text x={t.tx} y={t.ty + 4} className="cl-num">{t.label}</text>}
        </g>
      ))}
    </g>
  );
}

const LAMPS = [
  ["L", "green", <path key="a" d="M2 12l8-7v4h12v6H10v4z" fill="currentColor" />],
  ["beam", "green", <path key="a" d="M10 5c-4 0-7 3-7 7s3 7 7 7h1V5z M14 7l8 2M14 11l8 2M14 15l8 2" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />],
  ["belt", "red", <g key="a"><circle cx="12" cy="4" r="2.6" fill="currentColor" /><path d="M7 22v-8c0-3 2-6 5-6s5 3 5 6v8z" fill="currentColor" /></g>],
  ["abs", "amber", <g key="a"><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M3 6a12 12 0 0 0 0 12M21 6a12 12 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" /></g>],
  ["eco", "green", <path key="a" d="M4 20C4 9 11 4 21 4c0 10-5 17-16 17z" fill="currentColor" />],
  ["R", "green", <path key="a" d="M22 12l-8-7v4H2v6h12v4z" fill="currentColor" />],
];

const setAttr = (cache, key, node, name, v) => {
  if (cache.get(key) !== v) { cache.set(key, v); node.setAttribute(name, v); }
};
const setText = (cache, key, node, v) => {
  if (cache.get(key) !== v) { cache.set(key, v); node.textContent = v; }
};

/**
 * Instrument cluster v2 (FR-MOTION-003/004). Rendered entirely in SVG; the animation loop writes to
 * DOM attributes through refs (no per-frame React state), pauses off-screen / in a hidden tab, and
 * shows one static frame under prefers-reduced-motion.
 */
export default function InstrumentCluster() {
  const rootRef = useRef(null);
  const els = useRef({});
  const simRef = useRef(null);
  const tickRef = useRef({ buf: [], index: 0, acc: 0, rng: createRng(7) });
  const cache = useRef(new Map());
  const reduced = usePrefersReducedMotion();
  const inView = useInView(rootRef, { trackDocumentVisibility: false });
  const visible = useDocumentVisible();
  const running = inView && visible && !reduced;

  /** Write the current sim state to the DOM (attributes/text only, change-gated). */
  const paint = (force) => {
    const e = els.current;
    const c = cache.current;
    const sim = simRef.current;
    const s = snapshot(sim);
    setAttr(c, "sn", e.spdNeedle, "transform", `rotate(${s.speedAngle.toFixed(2)} ${SPD.cx} ${SPD.cy})`);
    setAttr(c, "rn", e.rpmNeedle, "transform", `rotate(${s.rpmAngle.toFixed(2)} ${RPM.cx} ${RPM.cy})`);
    setAttr(c, "as", e.arcSpd, "stroke-dasharray", `${(Math.max(0, Math.min(1, s.speedFrac)) * 1000).toFixed(1)} 1000`);
    setAttr(c, "ar", e.arcRpm, "stroke-dasharray", `${(Math.max(0, Math.min(1, s.rpmFrac)) * 1000).toFixed(1)} 1000`);
    // Digital values are throttled to 5 Hz like production clusters.
    const lastDigital = c.get("dig");
    if (force || lastDigital === undefined || sim.t - lastDigital >= 0.2) {
      c.set("dig", sim.t);
      setText(c, "spd", e.roSpeed, s.speedText);
      setText(c, "rpm", e.roRpm, s.rpmText);
      setText(c, "trip", e.trip, s.tripText);
    }
    setText(c, "gear", e.gear, s.gear);
    setText(c, "mode", e.mode, s.mode);
    for (const k of ["P", "N", "D"]) {
      const on = k === "D" ? /\d/.test(s.gear) : s.gear === k;
      setAttr(c, `pr${k}`, e[`pr${k}`], "data-on", on ? "1" : "0");
    }
    for (const [k] of LAMPS) setAttr(c, `l${k}`, e[`lamp${k}`], "data-on", s.lamps[k] ? "1" : "0");
  };

  const ticker = (dt, force) => {
    const tk = tickRef.current;
    tk.acc += dt;
    if (!force && tk.acc < 0.1) return;
    tk.acc = 0;
    els.current.can.textContent = pushTicker(tk.buf, canLine(simRef.current, tk.index, tk.rng));
    tk.index += 1;
  };

  // Initial / reduced-motion frame.
  useEffect(() => {
    const tk = tickRef.current;
    tk.buf = []; tk.index = 0; tk.rng = createRng(7);
    cache.current.clear();
    simRef.current = reduced ? staticSim() : createSim();
    paint(true);
    for (let i = 0; i < (reduced ? CLUSTER.tickerLines : 1); i += 1) ticker(0, true);
  }, [reduced]);

  // Animation loop: only scheduled while visible, in view and motion is allowed.
  useEffect(() => {
    if (!running) return undefined;
    let id = 0;
    let prev = performance.now();
    const frame = (now) => {
      const dt = Math.min(CLUSTER.maxDt, Math.max(0, (now - prev) / 1000));
      prev = now;
      advance(simRef.current, dt);
      paint(false);
      ticker(dt, false);
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [running]);

  const reg = (name) => (node) => { if (node) els.current[name] = node; };

  return (
    <div
      ref={rootRef}
      className="cluster"
      role="img"
      aria-label="HMI cluster demo, simulated data: speedometer, tachometer, gear indicator, warning lamps and a CAN message ticker"
    >
      <svg viewBox={`0 0 ${CLUSTER.viewW} ${CLUSTER.viewH}`} className="cluster-svg" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="clSpd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#34d399" /><stop offset="1" stopColor="#22d3ee" /></linearGradient>
          <linearGradient id="clRpm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#fb7185" /></linearGradient>
          <filter id="clHalo" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter>
        </defs>
        <rect x="0" y="0" width={CLUSTER.viewW} height={CLUSTER.viewH} rx="28" className="cl-bg" />
        <Dial d={SPD} face={SPD_FACE} />
        <Dial d={RPM} face={RPM_FACE} />
        <path d={REDZONE} className="cl-red" />
        <text x={SPD.cx} y={SPD.cy - 52} className="cl-label cl-label-cyan">HMI CLUSTER DEMO</text>
        <text x={RPM.cx} y={RPM.cy - 52} className="cl-label cl-label-rose">x1000 r/min</text>
        <path d={ARC_SPD} className="cl-halo cl-halo-cyan" filter="url(#clHalo)" />
        <path d={ARC_RPM} className="cl-halo cl-halo-amber" filter="url(#clHalo)" />

        <path ref={reg("arcSpd")} d={ARC_SPD} className="cl-arc" stroke="url(#clSpd)" pathLength="1000" strokeDasharray="0 1000" />
        <path ref={reg("arcRpm")} d={ARC_RPM} className="cl-arc" stroke="url(#clRpm)" pathLength="1000" strokeDasharray="0 1000" />

        {[[SPD, "spdNeedle"], [RPM, "rpmNeedle"]].map(([d, name]) => (
          <g key={name} ref={reg(name)}>
            <polygon points={`${d.cx},196.5 ${d.cx + 132},199.3 ${d.cx + 134},200 ${d.cx + 132},200.7 ${d.cx},203.5`} fill="#fbbf24" />
            <polygon points={`${d.cx},197 ${d.cx - 22},199 ${d.cx - 22},201 ${d.cx},203`} fill="#b45309" />
            <circle cx={d.cx} cy={d.cy} r="11" fill="#f59e0b" />
            <circle cx={d.cx} cy={d.cy} r="4.5" fill="#060c18" />
          </g>
        ))}

        {LAMPS.map(([k, color, icon], i) => (
          <g key={k} ref={reg(`lamp${k}`)} className={`cl-lamp cl-lamp-${color}`} data-on="0" transform={`translate(${480 - 3 * 40 + i * 40 + 8} 20) scale(1.1)`}>{icon}</g>
        ))}

        <text x={SPD.cx} y="312" className="cl-speed" ref={reg("roSpeed")}>0</text>
        <text x={SPD.cx} y="338" className="cl-unit">KM/H</text>
        <text x={RPM.cx} y="312" className="cl-rpm" ref={reg("roRpm")}>0</text>
        <text x={RPM.cx} y="338" className="cl-unit">RPM</text>

        <g className="cl-prnd">
          {["P", "N", "D"].map((k, i) => (
            <text key={k} x={480 + (i - 1) * 34} y="126" ref={reg(`pr${k}`)} data-on="0">{k}</text>
          ))}
        </g>
        <text x="480" y="204" className="cl-gear" ref={reg("gear")}>P</text>
        <text x="480" y="236" className="cl-mode" ref={reg("mode")}>READY</text>
        <text x="480" y="266" className="cl-trip" ref={reg("trip")}>TRIP 0.00 km</text>
      </svg>
      <div className="cluster-can">
        <div className="cluster-can-hdr"><span>CAN FRAMES</span><span className="cluster-sim">SIMULATED</span></div>
        <pre ref={reg("can")} />
      </div>
    </div>
  );
}
