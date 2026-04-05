import { motion } from 'framer-motion';

import { cn } from '../../lib/utils';

export function ShiningText({ text, className, as: Component = 'p' }) {
  const MotionComponent =
    Component === 'span'
      ? motion.span
      : Component === 'h1'
        ? motion.h1
        : Component === 'div'
          ? motion.div
          : motion.p;

  return (
    <MotionComponent
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        repeat: Infinity,
        duration: 2.2,
        ease: 'linear',
      }}
      className={cn(
        'bg-[linear-gradient(110deg,rgba(148,163,184,0.58),35%,rgba(255,255,255,0.98),50%,rgba(148,163,184,0.58),75%,rgba(148,163,184,0.58))] bg-[length:200%_100%] bg-clip-text text-transparent',
        className,
      )}
    >
      {text}
    </MotionComponent>
  );
}
