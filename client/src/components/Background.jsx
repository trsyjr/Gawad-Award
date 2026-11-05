import { motion, useReducedMotion } from 'motion/react';

// Deep gold glows drifting slowly behind everything.
const glows = [
  { left: '-12%', top: '-10%', size: 620, x: [0, 70, -30, 0], y: [0, 50, -20, 0], duration: 30, opacity: 0.32 },
  { left: '66%', top: '-14%', size: 560, x: [0, -60, 40, 0], y: [0, 60, 10, 0], duration: 34, opacity: 0.26 },
  { left: '-8%', top: '62%', size: 520, x: [0, 60, -20, 0], y: [0, -60, 20, 0], duration: 32, opacity: 0.22 },
  { left: '62%', top: '60%', size: 600, x: [0, -50, 30, 0], y: [0, -40, 30, 0], duration: 36, opacity: 0.28 },
];

// Fixed values (no randomness) so the layout is the same on every load.
const dust = Array.from({ length: 26 }, (_, i) => ({
  left: `${(i * 37 + 11) % 98}%`,
  size: 2 + (i % 4),
  duration: 14 + ((i * 7) % 18),
  delay: -((i * 2.9) % 26),
  drift: `${((i % 5) - 2) * 28}px`,
}));

const rays = 'repeating-conic-gradient(from 0deg, rgba(212,175,55,0.10) 0deg 3deg, transparent 3deg 16deg)';
const rayMask = 'radial-gradient(circle, #000 0%, transparent 36%)';

export default function Background() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-onyx">
      {/* Spotlight from the top */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(60% 46% at 50% 0%, rgba(212,175,55,0.24), transparent 70%)' }}
      />

      {/* Slowly turning rays of light */}
      <motion.div
        className="absolute"
        style={{
          left: '50%',
          top: '14%',
          width: '220vmax',
          height: '220vmax',
          marginLeft: '-110vmax',
          marginTop: '-110vmax',
          background: rays,
          WebkitMaskImage: rayMask,
          maskImage: rayMask,
        }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 180, repeat: Infinity, ease: 'linear' }}
      />

      {glows.map((glow, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: glow.size,
            height: glow.size,
            left: glow.left,
            top: glow.top,
            background: '#8a6516',
            opacity: glow.opacity,
          }}
          animate={reduce ? undefined : { x: glow.x, y: glow.y }}
          transition={{ duration: glow.duration, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {dust.map((d, i) => (
        <span
          key={i}
          className="dust"
          style={{
            left: d.left,
            width: d.size,
            height: d.size,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
            '--drift': d.drift,
          }}
        />
      ))}

      {/* Dark vignette so the edges fall away */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)' }}
      />
    </div>
  );
}
