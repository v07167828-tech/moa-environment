import { useMemo, type CSSProperties } from "react";

/**
 * Procedural "electric plasma" core for MOA.
 *
 * Nothing here is a bitmap: the branching filigree is generated as SVG paths
 * from a seeded PRNG, so it can be re-tuned, re-seeded and animated freely.
 * Every branch flickers on its own non-harmonic timing, so the composite
 * never visibly loops.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Branch = { d: string; w: number; delay: number; dur: number; len: number };

/** Grows lightning-like branches from the sphere centre outwards. */
function buildBranches(seed: number, count: number): Branch[] {
  const rnd = mulberry32(seed);
  const out: Branch[] = [];

  const grow = (
    x: number,
    y: number,
    angle: number,
    depth: number,
    step: number,
    width: number,
  ) => {
    let cx = x;
    let cy = y;
    let a = angle;
    let d = `M ${cx.toFixed(2)} ${cy.toFixed(2)}`;
    let len = 0;
    const segments = 3 + Math.floor(rnd() * 4);
    for (let i = 0; i < segments; i++) {
      a += (rnd() - 0.5) * 1.1;
      const s = step * (0.65 + rnd() * 0.7);
      const nx = cx + Math.cos(a) * s;
      const ny = cy + Math.sin(a) * s;
      // keep inside the sphere
      if (Math.hypot(nx - 50, ny - 50) > 46) break;
      const mx = (cx + nx) / 2 + (rnd() - 0.5) * s * 0.5;
      const my = (cy + ny) / 2 + (rnd() - 0.5) * s * 0.5;
      d += ` Q ${mx.toFixed(2)} ${my.toFixed(2)} ${nx.toFixed(2)} ${ny.toFixed(2)}`;
      len += s;
      cx = nx;
      cy = ny;
      if (depth < 3 && rnd() > 0.55) {
        grow(cx, cy, a + (rnd() > 0.5 ? 1 : -1) * (0.5 + rnd()), depth + 1, s * 0.72, width * 0.62);
      }
    }
    if (len > 2)
      out.push({
        d,
        w: width,
        delay: rnd() * -9,
        dur: 3.2 + rnd() * 6.5,
        len: Math.max(len, 1),
      });
  };

  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + rnd() * 0.6;
    const r = 4 + rnd() * 9;
    grow(50 + Math.cos(a) * r, 50 + Math.sin(a) * r, a, 0, 11, 1.5);
  }
  return out;
}

export function OrbEnergy({
  seed = 7,
  /** 0 = fully settled/absorbed (dormant), 1 = fully alive. */
  energy = 1,
  animate = true,
  /** Dampens the filigree so an avatar underneath stays readable. */
  subtle = false,
}: {
  seed?: number;
  energy?: number;
  animate?: boolean;
  subtle?: boolean;
}) {
  const branches = useMemo(() => buildBranches(seed, subtle ? 6 : 10), [seed, subtle]);
  const uidPrefix = useMemo(() => `moa-orb-${seed}${subtle ? "-s" : ""}`, [seed, subtle]);

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={
        {
          opacity: subtle ? 0.55 * energy + 0.12 : 0.35 + 0.65 * energy,
          transition: "opacity 900ms ease",
        } as CSSProperties
      }
    >
      <defs>
        <radialGradient id={`${uidPrefix}-core`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.98 0.06 220)" stopOpacity="0.95" />
          <stop offset="35%" stopColor="oklch(0.8 0.16 225)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.45 0.17 262)" stopOpacity="0.1" />
        </radialGradient>
        <radialGradient id={`${uidPrefix}-rim`} cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor="oklch(0.7 0.15 232)" stopOpacity="0" />
          <stop offset="93%" stopColor="oklch(0.88 0.15 214)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.98 0.08 210)" stopOpacity="0.15" />
        </radialGradient>
        <filter id={`${uidPrefix}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id={`${uidPrefix}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
      </defs>

      {/* deep internal glow */}
      <circle cx="50" cy="50" r="48" fill={`url(#${uidPrefix}-core)`} />

      {/* branching energy — glow copy then crisp copy */}
      <g filter={`url(#${uidPrefix}-soft)`} opacity={0.75}>
        {branches.map((b, i) => (
          <path
            key={`g${i}`}
            d={b.d}
            fill="none"
            stroke="oklch(0.85 0.15 218)"
            strokeWidth={b.w * 2.1}
            strokeLinecap="round"
            style={
              animate
                ? {
                    animation: `moa-vein-flicker ${b.dur}s ${b.delay}s ease-in-out infinite`,
                  }
                : undefined
            }
          />
        ))}
      </g>
      <g filter={`url(#${uidPrefix}-blur)`}>
        {branches.map((b, i) => (
          <path
            key={`c${i}`}
            d={b.d}
            fill="none"
            stroke="oklch(0.99 0.04 210)"
            strokeWidth={b.w}
            strokeLinecap="round"
            strokeDasharray={`${b.len * 0.55} ${b.len}`}
            style={
              animate
                ? {
                    animation: `moa-vein-travel ${b.dur * 1.7}s ${b.delay}s linear infinite, moa-vein-flicker ${b.dur * 0.8}s ${b.delay / 2}s ease-in-out infinite`,
                  }
                : undefined
            }
          />
        ))}
      </g>

      {/* drifting plasma blobs give the interior depth */}
      {!subtle &&
        [0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={50 + (i - 1) * 9}
            cy={46 + i * 6}
            r={14 - i * 2.5}
            fill="oklch(0.85 0.14 224)"
            opacity={0.16}
            filter={`url(#${uidPrefix}-soft)`}
            style={
              animate
                ? { animation: `moa-plasma-drift ${9 + i * 4.3}s ${i * -3}s ease-in-out infinite` }
                : undefined
            }
          />
        ))}

      {/* rim light + specular */}
      <circle cx="50" cy="50" r="49" fill={`url(#${uidPrefix}-rim)`} />
      <ellipse
        cx="35"
        cy="30"
        rx="14"
        ry="9"
        fill="oklch(0.99 0.02 210)"
        opacity={subtle ? 0.12 : 0.28}
        filter={`url(#${uidPrefix}-soft)`}
        transform="rotate(-24 35 30)"
      />
    </svg>
  );
}
