"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

import { cn } from '../../lib/utils';

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

export function ContainerScroll({
  titleComponent,
  children,
  compact = false,
  motionPreset = 'default',
  glowColor = 'purple',
  containerClassName,
  innerClassName,
  cardClassName,
  contentClassName,
  titleClassName,
}) {
  const containerRef = useRef(null);
  const isShowcase = motionPreset === 'showcase';
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isShowcase ? ['start end', 'end 40%'] : ['start end', 'end start'],
  });
  const [isMobile, setIsMobile] = useState(false);
  const settlePoint = isMobile ? 0.78 : 0.82;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    if (isShowcase) {
      return isMobile ? [0.8, 0.92, 1] : [0.84, 0.94, 1];
    }

    if (compact) {
      return isMobile ? [0.95, 1] : [0.96, 1];
    }

    return isMobile ? [0.82, 0.96] : [1.04, 1];
  };

  const rotate = useTransform(
    scrollYProgress,
    isShowcase ? [0, 0.56, settlePoint, 1] : [0, 1],
    isShowcase
      ? [isMobile ? 13 : 18, isMobile ? 5.5 : 8.5, 0, 0]
      : [compact ? 10 : 20, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    isShowcase ? [0, 0.58, settlePoint, 1] : [0, 1],
    isShowcase ? [...scaleDimensions(), 1] : scaleDimensions(),
  );
  const translate = useTransform(
    scrollYProgress,
    isShowcase ? [0, 0.58, settlePoint, 1] : [0, 1],
    isShowcase
      ? [0, isMobile ? -30 : -48, isMobile ? -54 : -78, isMobile ? -54 : -78]
      : [0, compact ? -36 : -100],
  );
  const lift = useTransform(
    scrollYProgress,
    isShowcase ? [0, 0.56, settlePoint, 1] : [0, 1],
    isShowcase ? [isMobile ? 84 : 116, isMobile ? 30 : 46, 0, 0] : [0, 0],
  );

  const springConfig = isShowcase
    ? { stiffness: 92, damping: 24, mass: 0.72 }
    : { stiffness: 120, damping: 26, mass: 0.6 };

  const smoothRotate = useSpring(rotate, springConfig);
  const smoothScale = useSpring(scale, springConfig);
  const smoothLift = useSpring(lift, springConfig);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isShowcase
          ? 'min-h-[110vh] items-start p-2 pt-4 md:min-h-[135vh] md:p-8 md:pt-8'
          : compact
            ? 'min-h-[28rem] md:min-h-[36rem] p-2 md:p-8'
            : 'h-[60rem] md:h-[80rem] p-2 md:p-20',
        containerClassName,
      )}
      ref={containerRef}
    >
      <div
        className={cn(
          'relative w-full',
          isShowcase
            ? 'sticky top-10 py-10 md:top-18 md:py-20'
            : compact
              ? 'py-6 md:py-14'
              : 'py-10 md:py-40',
          innerClassName,
        )}
        style={{
          perspective: isShowcase ? '1400px' : '1000px',
        }}
      >
        {titleComponent ? (
          <Header translate={translate} titleComponent={titleComponent} className={titleClassName} />
        ) : null}
        <Card
          rotate={smoothRotate}
          scale={smoothScale}
          lift={smoothLift}
          glowColor={glowColor}
          className={cardClassName}
          compact={compact}
          showcase={isShowcase}
        >
          <div
            className={cn(
              'h-full w-full overflow-hidden rounded-[24px] bg-zinc-950/90',
              compact ? '' : 'md:p-4',
              contentClassName,
            )}
          >
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Header({ translate, titleComponent, className }) {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className={cn('mx-auto max-w-5xl text-center', className)}
    >
      {titleComponent}
    </motion.div>
  );
}

function Card({ rotate, scale, lift, children, className, compact, showcase, glowColor }) {
  const cardRef = useRef(null);
  const { base, spread } = glowColorMap[glowColor] ?? glowColorMap.purple;

  useEffect(() => {
    const setGlowPosition = (x, y, rect = cardRef.current?.getBoundingClientRect()) => {
      if (!cardRef.current) return;
      if (!rect) return;

      const localX = Math.max(0, Math.min(rect.width, x - rect.left));
      const localY = Math.max(0, Math.min(rect.height, y - rect.top));
      cardRef.current.style.setProperty('--scroll-glow-x', `${localX.toFixed(2)}px`);
      cardRef.current.style.setProperty('--scroll-glow-y', `${localY.toFixed(2)}px`);
      cardRef.current.style.setProperty('--scroll-glow-xp', (localX / Math.max(rect.width, 1)).toFixed(3));
      cardRef.current.style.setProperty('--scroll-glow-yp', (localY / Math.max(rect.height, 1)).toFixed(3));
    };

    const syncPointer = (event) => {
      setGlowPosition(event.clientX, event.clientY);
    };

    const seedCenterGlow = () => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setGlowPosition(rect.left + rect.width / 2, rect.top + rect.height / 2, rect);
    };

    seedCenterGlow();
    window.addEventListener('pointermove', syncPointer);
    window.addEventListener('resize', seedCenterGlow);
    return () => {
      window.removeEventListener('pointermove', syncPointer);
      window.removeEventListener('resize', seedCenterGlow);
    };
  }, []);

  return (
    <motion.div
      ref={cardRef}
      style={{
        '--scroll-glow-base': base,
        '--scroll-glow-spread': spread,
        '--scroll-glow-radius': compact ? '28px' : '30px',
        '--scroll-glow-border-width': showcase ? '3px' : '2.5px',
        '--scroll-glow-x': '50%',
        '--scroll-glow-y': '50%',
        '--scroll-glow-xp': '0.5',
        '--scroll-glow-yp': '0.5',
        '--scroll-glow-hue': 'calc(var(--scroll-glow-base) + (var(--scroll-glow-xp) * var(--scroll-glow-spread)))',
        rotateX: rotate,
        scale,
        y: lift,
        transformOrigin: 'center top',
        transformPerspective: 1400,
        position: 'relative',
        touchAction: 'none',
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className={cn(
        'scroll-spotlight-card mx-auto w-full bg-[#171823] shadow-2xl will-change-transform',
        showcase && 'max-w-6xl',
        compact
          ? 'max-w-6xl rounded-[28px] p-1.5 md:p-3'
          : 'max-w-5xl -mt-12 h-[30rem] rounded-[30px] p-2 md:h-[40rem] md:p-6',
        className,
      )}
    >
      <div className="scroll-spotlight-card__glow" aria-hidden="true" />
      <div className="scroll-spotlight-card__content">{children}</div>
    </motion.div>
  );
}
