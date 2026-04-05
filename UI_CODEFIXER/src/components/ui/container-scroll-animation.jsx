"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { cn } from '../../lib/utils';

export function ContainerScroll({
  titleComponent,
  children,
  compact = false,
  containerClassName,
  innerClassName,
  cardClassName,
  contentClassName,
  titleClassName,
}) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const [isMobile, setIsMobile] = useState(false);

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
    if (compact) {
      return isMobile ? [0.95, 1] : [0.96, 1];
    }
    return isMobile ? [0.82, 0.96] : [1.04, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [compact ? 10 : 20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, compact ? -36 : -100]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        compact ? 'min-h-[28rem] md:min-h-[36rem] p-2 md:p-8' : 'h-[60rem] md:h-[80rem] p-2 md:p-20',
        containerClassName,
      )}
      ref={containerRef}
    >
      <div
        className={cn('relative w-full', compact ? 'py-6 md:py-14' : 'py-10 md:py-40', innerClassName)}
        style={{
          perspective: '1000px',
        }}
      >
        {titleComponent ? (
          <Header translate={translate} titleComponent={titleComponent} className={titleClassName} />
        ) : null}
        <Card rotate={rotate} scale={scale} className={cardClassName} compact={compact}>
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

function Card({ rotate, scale, children, className, compact }) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          '0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003',
      }}
      className={cn(
        'mx-auto w-full border-4 border-white/15 bg-[#171823] shadow-2xl',
        compact
          ? 'max-w-6xl rounded-[28px] p-1.5 md:p-3'
          : 'max-w-5xl -mt-12 h-[30rem] rounded-[30px] p-2 md:h-[40rem] md:p-6',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
