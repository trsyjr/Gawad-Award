import { motion, useReducedMotion } from 'motion/react';

/**
 * Makes its children hover up and down above a soft ground shadow.
 * The shadow shrinks and fades as the content rises, which is what sells the "floating" look.
 *
 * Props:
 *  - shadow: CSS colour for the ground shadow (omit for no shadow)
 *  - amplitude: how many px to rise
 *  - disabled: turn the loop off (used for long lists to keep things smooth)
 */
export default function Floaty({
  children,
  delay = 0,
  amplitude = 10,
  duration = 5.5,
  shadow,
  disabled = false,
  className = '',
}) {
  const reduce = useReducedMotion();
  const still = reduce || disabled;
  const loop = { duration, delay, repeat: Infinity, ease: 'easeInOut' };

  return (
    <div className={`relative isolate h-full ${className}`}>
      <motion.div className="relative h-full" animate={still ? undefined : { y: [0, -amplitude, 0] }} transition={loop}>
        {children}
      </motion.div>
      {shadow && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[12%] -bottom-5 -z-10 h-5 rounded-full blur-lg"
          style={{ background: shadow }}
          animate={still ? undefined : { scaleX: [1, 0.78, 1], opacity: [0.55, 0.28, 0.55] }}
          transition={loop}
        />
      )}
    </div>
  );
}
