import { cn } from '../../lib/utils';

export function AiLoader({
  size = 116,
  text = 'Generating',
  inline = false,
  className,
}) {
  const letters = text.split('');

  return (
    <div className={cn(inline ? 'ai-loader-inline' : 'ai-loader-overlay', className)}>
      <div
        className="ai-loader"
        style={{ width: size, height: size }}
        aria-live="polite"
        aria-label={text}
      >
        <div className="ai-loader__letters">
          {letters.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="ai-loader__letter"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {letter}
            </span>
          ))}
        </div>
        <div className="ai-loader__ring" />
      </div>
    </div>
  );
}

export { AiLoader as Component };
