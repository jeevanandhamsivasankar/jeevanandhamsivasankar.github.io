import { createParticles, mulberry32, PARTICLE_SEED } from "../../lib/random.js";

// Generated once at module load (seeded) so positions are stable across renders and runs
const PARTICLES = createParticles(18, mulberry32(PARTICLE_SEED));

export default function Particles() {
  return (
    <>
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="particle"
          aria-hidden="true"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.opacity,
            "--dur": `${p.dur}s`,
            "--delay": `${p.delay}s`,
            "--dx": p.dx,
          }}
        />
      ))}
    </>
  );
}
