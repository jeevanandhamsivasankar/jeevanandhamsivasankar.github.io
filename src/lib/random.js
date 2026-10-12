// UNIT-RANDOM: seeded PRNG and particle generation (SUDS 5.2, ADR-007).

export const PARTICLE_SEED = 0x4a5356;
export const PARTICLE_COLORS = Object.freeze(["#f59e0b", "#22d3ee", "#34d399", "#a78bfa", "#fb7185"]);

/** Canonical mulberry32. @returns {() => number} values in [0, 1) */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @typedef {{id:number,x:number,y:number,size:number,dur:number,delay:number,dx:string,color:string,opacity:number}} Particle
 * @returns {ReadonlyArray<Particle>} deep-frozen
 */
export function createParticles(count, rng) {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError("createParticles: count must be a non-negative integer");
  }
  if (typeof rng !== "function") throw new TypeError("createParticles: rng must be a function");
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const x = rng() * 100;
    const y = 20 + rng() * 70;
    const size = 1.5 + rng() * 2.5;
    const dur = 4 + rng() * 5;
    const delay = rng() * 6;
    const dx = (rng() - 0.5) * 60 + "px";
    const color = PARTICLE_COLORS[Math.floor(rng() * 5)];
    const opacity = 0.3 + rng() * 0.5;
    out.push(Object.freeze({ id: i, x, y, size, dur, delay, dx, color, opacity }));
  }
  return Object.freeze(out);
}
