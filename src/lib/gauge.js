// UNIT-GAUGE: speedometer maths (SUDS 5.3). Operand order matches the baseline bit-for-bit.

export const GAUGE = Object.freeze({
  cx: 130, cy: 130, r: 100, rpmR: 112, minA: -215, maxA: 35,
  maxSpeed: 180, maxRpm: 8000, needleLen: 84, tickCount: 19, dt: 0.006,
});

/** @typedef {{ speed:number, rpm:number }} GaugeFrame */

export function speedAt(t) {
  return Math.sin(t * 0.5) * 45 + 88 + Math.sin(t * 1.4) * 22;
}

export function rpmAt(t) {
  return Math.sin(t * 0.7 + 1) * 1200 + 2800 + Math.cos(t * 1.1) * 500;
}

/** @returns {GaugeFrame} */
export function gaugeFrame(t) {
  return { speed: speedAt(t), rpm: rpmAt(t) };
}

export function speedAngle(speed) {
  return GAUGE.minA + (Math.min(speed, GAUGE.maxSpeed) / GAUGE.maxSpeed) * (GAUGE.maxA - GAUGE.minA);
}

export function rpmAngle(rpm) {
  return -215 + (Math.min(rpm, GAUGE.maxRpm) / GAUGE.maxRpm) * 250;
}

export function arcPath(cx, cy, r, from, to) {
  const rad = (d) => (d * Math.PI) / 180;
  const s = { x: cx + r * Math.cos(rad(from)), y: cy + r * Math.sin(rad(from)) };
  const e = { x: cx + r * Math.cos(rad(to)), y: cy + r * Math.sin(rad(to)) };
  const lg = to - from > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${lg} 1 ${e.x} ${e.y}`;
}

/** @returns {{x:number, y:number}} */
export function needlePoint(angleDeg) {
  return {
    x: GAUGE.cx + GAUGE.needleLen * Math.cos((angleDeg * Math.PI) / 180),
    y: GAUGE.cy + GAUGE.needleLen * Math.sin((angleDeg * Math.PI) / 180),
  };
}

/** @returns {ReadonlyArray<{x1:number,y1:number,x2:number,y2:number,major:boolean}>} 19 frozen ticks */
export function gaugeTicks() {
  const { cx, cy, r, minA, maxA, tickCount } = GAUGE;
  const ticks = [];
  for (let i = 0; i < tickCount; i += 1) {
    const a = ((minA + (i / (tickCount - 1)) * (maxA - minA)) * Math.PI) / 180;
    const major = i % 3 === 0;
    const r2 = r - (major ? 18 : 10);
    ticks.push(Object.freeze({
      x1: cx + r * Math.cos(a), y1: cy + r * Math.sin(a),
      x2: cx + r2 * Math.cos(a), y2: cy + r2 * Math.sin(a), major,
    }));
  }
  return Object.freeze(ticks);
}
