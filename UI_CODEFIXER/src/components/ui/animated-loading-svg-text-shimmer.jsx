import { forwardRef, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '../../lib/utils';

let cachedPathLength = 0;

const Loader = forwardRef(function Loader(
  { className, size = 18, strokeWidth = 2.5, ...props },
  ref,
) {
  const pathRef = useRef(null);
  const [pathLength, setPathLength] = useState(cachedPathLength);

  useEffect(() => {
    if (!cachedPathLength && pathRef.current) {
      cachedPathLength = pathRef.current.getTotalLength();
      setPathLength(cachedPathLength);
    }
  }, []);

  const isReady = pathLength > 0;

  return (
    <svg
      ref={ref}
      role="status"
      aria-label="Loading"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={cn('text-current', className)}
      {...props}
    >
      <path
        ref={pathRef}
        d="M4.43431 2.42415C-0.789139 6.90104 1.21472 15.2022 8.434 15.9242C15.5762 16.6384 18.8649 9.23035 15.9332 4.5183C14.1316 1.62255 8.43695 0.0528911 7.51841 3.33733C6.48107 7.04659 15.2699 15.0195 17.4343 16.9241"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          isReady
            ? {
                strokeDasharray: pathLength,
                strokeDashoffset: pathLength,
                '--path-length': pathLength,
              }
            : undefined
        }
        className={cn(
          'transition-opacity duration-300',
          isReady ? 'opacity-100 loading-breadcrumb__path' : 'opacity-0',
        )}
      />
    </svg>
  );
});

export function LoadingBreadcrumb({ text = 'Cooking', className }) {
  return (
    <div className={cn('loading-breadcrumb', className)}>
      <Loader size={18} strokeWidth={2.5} className="loading-breadcrumb__loader" />
      <span className="loading-breadcrumb__text">{text}</span>
      <ChevronRight size={16} className="loading-breadcrumb__chevron" />
    </div>
  );
}

export default LoadingBreadcrumb;
