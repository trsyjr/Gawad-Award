import { motion } from 'motion/react';

// Wraps each screen so it drifts in and out when the step changes.
export default function Page({ children, className = '' }) {
  return (
    <motion.main
      className={`w-full max-w-[1920px] mx-auto px-4 sm:px-8 xl:px-12 pt-8 pb-16 ${className}`}
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -32, scale: 0.98 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  );
}