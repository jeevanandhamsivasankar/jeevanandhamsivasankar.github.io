// UNIT-CLUSTER: pure physics, gearbox, drive-cycle and CAN-ticker model for the instrument cluster (FR-MOTION-003).
// No DOM, no timers, no React: everything here is deterministic and unit-testable.
// Ported from docs/design/motion-prototypes/cluster-v2.html. All values are SIMULATED demo data.

export const CLUSTER = Object.freeze({
  viewW: 960, viewH: 400,
  minA: -215, maxA: 35,
  speed: Object.freeze({ cx: 250, cy: 200, r: 150, max: 200 }),
  rpm: Object.freeze({ cx: 710, cy: 200, r: 150, max: 8000, red: 6500 }),
  maxDt: 0.05,          // seconds: a stalled frame never "catches up"
  subStep: 1 / 240,     // fixed integrator step => frame-rate independence
  maxOvershoot: 0.03,   // documented design limit (3 % of step size)
  staticTime: 30.5,     // representative cruising frame for reduced motion
  tickerLines: 6,
});

/**
 * Drive cycle waypoints: [time s, target km/h, flag]. Looped. Flags drive telltales.
 * @type {ReadonlyArray<readonly [number, number, string]>}
 */
export const CYCLE = Object.freeze([
  [0, 0, ''], [3, 0, ''], [9, 52, ''], [14, 52, 'eco'], [16, 52, 'turnR'], [19, 52, 'eco'],
  [27, 112, ''], [34, 112, 'eco'], [36, 112, 'turnL'], [39, 112, 'eco'], [43, 74, ''], [50, 148, ''],
  [54, 148, 'eco'], [60, 0, 'brake'], [64, 0, ''],
].map((w) => Object.freeze(w)));
export const CYCLE_LEN = CYCLE[CYCLE.length - 1][0];

/** Upshift speed per current gear (index = gear), downshift hysteresis in km/h, rpm per km/h per gear. */
export const GEARS = Object.freeze({ up: [0, 18, 34, 54, 78, 104], downHyst: 6, ratio: [0, 165, 98, 70, 54, 44, 37], top: 6 });

const smooth = (x) => x * x * (3 - 2 * x);

/**
 * Target speed on the looped drive cycle.
 * @param {number} t seconds
 * @returns {{target:number, accel:number, flag:string, phase:number}}
 */
export function cycleAt(t) {
  const tt = ((t % CYCLE_LEN) + CYCLE_LEN) % CYCLE_LEN;
  for (let i = 0; i < CYCLE.length - 1; i += 1) {
    const [ta, va] = CYCLE[i];
    const [tb, vb, flag] = CYCLE[i + 1];
    if (tt >= ta && tt < tb) {
      return { target: va + (vb - va) * smooth((tt - ta) / (tb - ta)), accel: (vb - va) / (tb - ta), flag, phase: tt };
    }
  }
  return { target: 0, accel: 0, flag: '', phase: tt };
}

/**
 * Gear selection with hysteresis: upshift above UP[g], downshift only below UP[g-1] - hysteresis.
 * @param {number} speed km/h
 * @param {number} current current gear (0 = park)
 * @returns {number} 1..6
 */
export function gearFor(speed, current) {
  let g = Math.max(1, current);
  while (g < GEARS.top && speed > GEARS.up[g]) g += 1;
  while (g > 1 && speed < GEARS.up[g - 1] - GEARS.downHyst) g -= 1;
  return g;
}

/** Engine speed for a gear/speed/acceleration. */
export function rpmFor(speed, gear, accel) {
  if (speed < 1) return 780 + (accel > 0 ? 300 : 0);
  return Math.min(7600, Math.max(900, speed * GEARS.ratio[gear] + Math.max(0, accel) * 55));
}

/**
 * Damped needle state. zeta 0.8 gives about 1.5 % step overshoot (limit CLUSTER.maxOvershoot).
 * @param {number} omega natural frequency rad/s
 * @param {number} [zeta]
 * @returns {{x:number, v:number, omega:number, zeta:number}}
 */
export function createNeedle(omega, zeta = 0.8) {
  return { x: 0, v: 0, omega, zeta };
}

/**
 * Advance a second-order spring-damper toward `target` (semi-implicit Euler, fixed sub-steps).
 * `dt` is clamped to CLUSTER.maxDt. Mutates and returns `state`.
 * @param {{x:number, v:number, omega:number, zeta:number}} state
 * @param {number} target
 * @param {number} dt seconds
 */
export function stepNeedle(state, target, dt) {
  let acc = Math.min(Math.max(dt, 0), CLUSTER.maxDt);
  const { omega, zeta } = state;
  while (acc > 1e-9) {
    const h = Math.min(CLUSTER.subStep, acc);
    state.v += (omega * omega * (target - state.x) - 2 * zeta * omega * state.v) * h;
    state.x += state.v * h;
    acc -= h;
  }
  return state;
}

/** @returns {object} fresh simulation state at rest (park). */
export function createSim() {
  return {
    t: 0, speed: 0, gear: 0, rpm: 0, trip: 0, flag: '', accel: 0,
    spd: createNeedle(9.0), tach: createNeedle(14.0),
  };
}

/**
 * Advance the whole simulation by `dt` (clamped). Mutates and returns `sim`.
 * @param {ReturnType<typeof createSim>} sim
 * @param {number} dtRaw seconds
 */
export function advance(sim, dtRaw) {
  const dt = Math.min(Math.max(dtRaw, 0), CLUSTER.maxDt);
  sim.t += dt;
  const c = cycleAt(sim.t);
  sim.flag = c.flag;
  sim.accel = c.accel;
  sim.speed += (c.target - sim.speed) * (1 - Math.exp(-dt / 0.35));
  if (sim.speed < 0.3 && c.target < 0.5) sim.speed = 0;
  sim.gear = sim.speed < 0.5 && c.target < 0.5 ? (c.phase < 3 ? 0 : 1) : gearFor(sim.speed, sim.gear);
  sim.rpm = sim.gear === 0 ? 800 : rpmFor(sim.speed, sim.gear, c.accel);
  sim.trip += (sim.speed * dt) / 3600;
  stepNeedle(sim.spd, sim.speed, dt);
  stepNeedle(sim.tach, sim.rpm, dt);
  return sim;
}

/**
 * Deterministic static frame at simulation time `t` (reduced motion). Needles rest on their targets.
 * @param {number} [t]
 */
export function staticSim(t = CLUSTER.staticTime) {
  const sim = createSim();
  const n = Math.round(t * 60);
  for (let i = 0; i < n; i += 1) advance(sim, 1 / 60);
  sim.spd.x = sim.speed; sim.spd.v = 0;
  sim.tach.x = sim.rpm; sim.tach.v = 0;
  return sim;
}

/** Needle angle in degrees for a 0..1 fraction (slightly over-range allowed). */
export const angleFor = (frac) => CLUSTER.minA + (CLUSTER.maxA - CLUSTER.minA) * Math.max(-0.01, Math.min(1.02, frac));

/**
 * Display snapshot derived from sim state. Digital text is quantised, as in production clusters.
 * @param {ReturnType<typeof createSim>} sim
 * @param {boolean} [blinkOn] turn-signal phase (use `blinkPhase(sim.t)`)
 */
export function snapshot(sim, blinkOn = blinkPhase(sim.t)) {
  const sF = sim.spd.x / CLUSTER.speed.max;
  const rF = sim.tach.x / CLUSTER.rpm.max;
  const gear = sim.gear === 0 ? 'P' : sim.speed < 0.5 ? 'N' : String(sim.gear);
  let mode = 'READY';
  if (sim.flag === 'eco') mode = 'ECO CRUISE';
  else if (sim.accel > 2) mode = 'SPORT';
  else if (sim.flag === 'brake') mode = 'REGEN';
  return {
    speedFrac: sF, rpmFrac: rF,
    speedAngle: angleFor(sF), rpmAngle: angleFor(rF),
    speedText: String(Math.round(sim.speed)),
    rpmText: String(Math.round(sim.tach.x / 50) * 50),
    gear, mode,
    tripText: `TRIP ${sim.trip.toFixed(2)} km`,
    lamps: {
      L: sim.flag === 'turnL' && blinkOn, R: sim.flag === 'turnR' && blinkOn,
      beam: true, belt: sim.t < 3 && sim.gear === 0,
      abs: sim.flag === 'brake' && sim.speed > 20 && sim.speed < 90, eco: sim.flag === 'eco',
    },
  };
}

/** Turn signals flash at 1.5 Hz, 50 % duty. */
export const blinkPhase = (t) => t % (1 / 1.5) < 0.5 / 1.5;

/** Small seeded PRNG (mulberry32) so the ticker is reproducible in tests. */
export function createRng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (n, w) => n.toString(16).toUpperCase().padStart(w, '0');

/**
 * One simulated CAN-style ticker line. Frames rotate through four signals; the rolling counter comes from `rng`.
 * @param {ReturnType<typeof createSim>} sim
 * @param {number} index frame counter
 * @param {() => number} rng
 * @returns {string}
 */
export function canLine(sim, index, rng) {
  const lamp = sim.flag === 'turnL' ? 'L' : sim.flag === 'turnR' ? 'R' : '-';
  const frames = [
    ['0C4', `ENG_RPM ${String(Math.round(sim.tach.x)).padStart(4)}`],
    ['1A0', `VEH_SPD ${sim.speed.toFixed(1).padStart(5)}`],
    ['3B2', `GEAR_POS ${sim.gear === 0 ? 'P' : sim.gear}`],
    ['2F1', `TURN_IND ${lamp}`],
  ];
  const [id, text] = frames[index % frames.length];
  const rc = hex(Math.floor(rng() * 16), 1);
  return `${sim.t.toFixed(2).padStart(6)} 0x${id} rc${rc} ${text}`;
}

/**
 * Push a line onto a bounded ticker buffer (newest first) and return the joined text.
 * @param {string[]} buf
 * @param {string} line
 */
export function pushTicker(buf, line) {
  buf.unshift(line);
  if (buf.length > CLUSTER.tickerLines) buf.length = CLUSTER.tickerLines;
  return buf.join('\n');
}
